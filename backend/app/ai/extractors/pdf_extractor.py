import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any, TypedDict

import fitz


# purpose : Define the structure returned by local OCR for static type checking.
class PDFPageOCRResult(TypedDict):
    text: str
    chapter_title: str | None


class PDFExtractor:

    # purpose : Resolve file_url (which may have a leading '/') to an actual filesystem path.
    #           LocalStorage stores paths as '/uploads/...' for web serving, but the actual
    #           file lives at 'uploads/...' relative to the backend working directory.
    @staticmethod
    def resolve_path(file_url: str) -> str:
        if Path(file_url).exists():
            return file_url
        stripped = file_url.lstrip("/")
        if Path(stripped).exists():
            return stripped
        return file_url

    # purpose : Extract entire raw text from a PDF document as a single string for backward compatibility.
    def extract_text(
        self,
        file_path: str,
    ) -> str:
        resolved = self.resolve_path(file_path)
        path = Path(resolved)

        if not path.exists():
            raise FileNotFoundError(
                f"PDF not found: {file_path}"
            )

        extracted_text: list[str] = []
        pdf = fitz.open(path)

        try:
            for page in pdf:
                raw_text = page.get_text()
                text: str = raw_text if isinstance(raw_text, str) else ""
                extracted_text.append(text)
        finally:
            pdf.close()

        return "\n".join(extracted_text)

    # purpose : Check if a page's text is mostly garbled (Type3 font encoding issue).
    #           Returns True if less than 15% of characters are readable ASCII letters.
    def _is_garbled_text(self, text: str) -> bool:
        if not text or len(text) < 20:
            return True

        total = len(text)
        ascii_alpha = sum(
            1
            for c in text
            if c.isalpha() and ord(c) < 128
        )

        return (ascii_alpha / total) < 0.15

    # purpose : Extract text from a page image using local native macOS Vision framework OCR.
    #           Runs locally without any external network API calls or quota limits.
    def _extract_page_via_local_ocr(
        self,
        page: fitz.Page,
        page_num: int,
    ) -> PDFPageOCRResult:
        temp_img = None

        try:
            # Render PDF page to PNG image
            pix = page.get_pixmap(dpi=150)

            with tempfile.NamedTemporaryFile(
                suffix=".png",
                delete=False,
            ) as f:
                temp_img = f.name
                pix.save(temp_img)

            ocr_bin = "/tmp/macos_ocr"

            # Build OCR binary if not compiled yet
            if not os.path.exists(ocr_bin):
                swift_code = '''import Foundation
import Vision
import AppKit

let args = CommandLine.arguments
guard args.count > 1 else { exit(1) }
let imagePath = args[1]

guard let image = NSImage(contentsOfFile: imagePath),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    exit(1)
}

let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
let request = VNRecognizeTextRequest { (request, error) in
    guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
    for observation in observations {
        if let topCandidate = observation.topCandidates(1).first {
            print(topCandidate.string)
        }
    }
}
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true

try? requestHandler.perform([request])
'''

                with tempfile.NamedTemporaryFile(
                    suffix=".swift",
                    mode="w",
                    delete=False,
                ) as sf:
                    sf.write(swift_code)
                    swift_file = sf.name

                subprocess.run(
                    [
                        "swiftc",
                        "-O",
                        swift_file,
                        "-o",
                        ocr_bin,
                    ],
                    check=True,
                    capture_output=True,
                )

                os.remove(swift_file)

            res = subprocess.run(
                [ocr_bin, temp_img],
                capture_output=True,
                text=True,
            )

            extracted_text: str = res.stdout or ""

            # purpose : Detect if a new chapter heading starts on this page.
            detected_chapter = self._detect_chapter_title_from_text(
                extracted_text
            )

            return {
                "text": extracted_text,
                "chapter_title": detected_chapter,
            }

        except Exception as e:
            print(
                f"[PDFExtractor] Local OCR failed for page {page_num}: {e}"
            )

            return {
                "text": "",
                "chapter_title": None,
            }

        finally:
            if temp_img and os.path.exists(temp_img):
                try:
                    os.remove(temp_img)
                except Exception:
                    pass

    # purpose : Parse text to detect chapter/unit headings (e.g., 'CHAPTER 1: Chemical Reactions and Equations')
    def _detect_chapter_title_from_text(
        self,
        text: str,
    ) -> str | None:
        lines = [
            l.strip()
            for l in text.splitlines()
            if l.strip()
        ]

        for i, line in enumerate(lines[:12]):
            m = re.match(
                r'^(?:CHAPTER|UNIT)\s+(\d+|[IVX]+)(?:\s*[:\.\-]\s*|\s+)?(.*)$',
                line,
                re.IGNORECASE,
            )

            if m:
                num = m.group(1)
                title = m.group(2).strip()

                if not title and i + 1 < len(lines):
                    title = lines[i + 1]

                    if (
                        i + 2 < len(lines)
                        and lines[i + 2].startswith("and ")
                    ):
                        title += " " + lines[i + 2]

                elif (
                    title
                    and i + 1 < len(lines)
                    and (
                        lines[i + 1].startswith("and ")
                        or lines[i + 1].isupper()
                        or len(lines[i + 1]) < 30
                    )
                ):
                    if not any(
                        k in lines[i + 1].lower()
                        for k in [
                            "consider",
                            "facts",
                            "figure",
                            "activity",
                            "table",
                        ]
                    ):
                        title += " " + lines[i + 1]

                title = re.sub(
                    r'^\d+\s+',
                    '',
                    title,
                ).strip(" :.-")

                return (
                    f"Chapter {num}: {title}"
                    if title
                    else f"Chapter {num}"
                )

        return None

    # purpose : Detect chapters from PDF outline (TOC) or regex page heading analysis.
    def _detect_chapter_page_map(
        self,
        pdf: fitz.Document,
        total_pages: int,
    ) -> dict[int, str]:
        page_chapter_map: dict[int, str] = {}

        # Priority 1: Check PDF Table of Contents (TOC)
        try:
            toc = pdf.get_toc()

            if toc:
                toc_entries: list[tuple[int, str]] = []

                for entry in toc:
                    if isinstance(entry, (list, tuple)) and len(entry) >= 3:
                        lvl, title, pno = (
                            entry[0],
                            entry[1],
                            entry[2],
                        )

                        if (
                            isinstance(lvl, int)
                            and lvl in (1, 2)
                            and isinstance(pno, int)
                            and pno > 0
                            and isinstance(title, str)
                            and title
                        ):
                            clean_title = title.strip()

                            if clean_title:
                                toc_entries.append(
                                    (pno, clean_title)
                                )

                toc_entries.sort(
                    key=lambda x: x[0]
                )

                if toc_entries:
                    for idx, (start_p, c_title) in enumerate(
                        toc_entries
                    ):
                        end_p = (
                            toc_entries[idx + 1][0] - 1
                            if idx + 1 < len(toc_entries)
                            else total_pages
                        )

                        for p in range(
                            start_p,
                            min(
                                end_p + 1,
                                total_pages + 1,
                            ),
                        ):
                            page_chapter_map[p] = c_title

                    if len(page_chapter_map) > 0:
                        return page_chapter_map

        except Exception:
            pass

        # Priority 2 & 3: Page text heading regex scan
        current_chapter: str | None = None

        pattern_ch = re.compile(
            r'^(?:CHAPTER|UNIT)\s+(\d+|[IVX]+)[:\.\s\u2014\u2013-]*([^\n]*)',
            re.IGNORECASE | re.MULTILINE,
        )

        pattern_num = re.compile(
            r'^(\d+)[\.\:]\s+([A-Z][A-Za-z0-9\s\u2014\u2013-]{3,50})$',
            re.MULTILINE,
        )

        for p_index in range(total_pages):
            pno = p_index + 1

            raw_page_text = pdf[p_index].get_text()
            page_text: str = (
                raw_page_text
                if isinstance(raw_page_text, str)
                else ""
            )

            lines = [
                line.strip()
                for line in page_text.splitlines()
                if line.strip()
            ][:15]

            detected_in_page = None

            for idx, line in enumerate(lines):
                m_ch = pattern_ch.match(line)

                if m_ch:
                    num_part = m_ch.group(1)
                    rest_part = m_ch.group(2).strip()

                    # Check subsequent lines if title is split across lines
                    if idx + 1 < len(lines):
                        next_l = lines[idx + 1]

                        if (
                            (
                                not rest_part
                                or len(rest_part) < 35
                                or rest_part.lower().endswith(
                                    (
                                        "and",
                                        "its",
                                        "of",
                                        "the",
                                        "for",
                                        "in",
                                        "to",
                                        "with",
                                        "-",
                                    )
                                )
                            )
                            and not any(
                                k in next_l.lower()
                                for k in [
                                    "table",
                                    "figure",
                                    "activity",
                                    "question",
                                    "(i)",
                                    "(b)",
                                ]
                            )
                        ):
                            if not re.match(
                                r'^\d+[\.\:]',
                                next_l,
                            ):
                                rest_part = (
                                    f"{rest_part} {next_l}".strip()
                                    if rest_part
                                    else next_l
                                )

                    # Filter false-positive answer key headings (e.g. Chapter 1: 1. (i))
                    if (
                        re.search(
                            r'^\d+[\.\:]?\s*\(',
                            rest_part,
                        )
                        or rest_part.startswith(
                            ("1.", "2.", "3.")
                        )
                    ):
                        continue

                    detected_in_page = (
                        f"Chapter {num_part}: {rest_part}"
                        if rest_part
                        else f"Chapter {num_part}"
                    )

                    break

                m_num = pattern_num.match(line)

                if m_num:
                    num_part = m_num.group(1)
                    title_part = m_num.group(2).strip()

                    if not title_part.lower().startswith(
                        (
                            "table",
                            "figure",
                            "page",
                            "section",
                            "question",
                            "activity",
                            "answer",
                        )
                    ):
                        detected_in_page = (
                            f"Chapter {num_part}: {title_part}"
                        )
                        break

            if detected_in_page:
                current_chapter = detected_in_page

            if current_chapter:
                page_chapter_map[pno] = current_chapter

        return page_chapter_map

    # purpose : Extract page-by-page PDF content with page_number, chapter_title, and text metadata.
    #           Uses local native OCR for Type3-encoded (garbled) PDFs without external API calls.
    def extract_pages_with_metadata(
        self,
        file_path: str,
    ) -> list[dict[str, Any]]:
        resolved = self.resolve_path(file_path)
        path = Path(resolved)

        if not path.exists():
            raise FileNotFoundError(
                f"PDF not found: {file_path}"
            )

        pdf = fitz.open(path)
        pages_metadata: list[dict[str, Any]] = []

        try:
            total_pages = len(pdf)

            # Check if PDF text is readable or garbled
            sample_text: str = ""

            for i in range(min(5, total_pages)):
                raw_sample_text = pdf[i].get_text()

                page_sample_text: str = (
                    raw_sample_text
                    if isinstance(raw_sample_text, str)
                    else ""
                )

                sample_text += page_sample_text

            use_local_ocr = self._is_garbled_text(
                sample_text
            )

            if use_local_ocr:
                print(
                    f"[PDFExtractor] PDF uses Type3 encoding. "
                    f"Using local native OCR for {total_pages} pages."
                )

                current_chapter: str | None = None

                for p_idx in range(total_pages):
                    page_num = p_idx + 1
                    page = pdf[p_idx]

                    result = self._extract_page_via_local_ocr(
                        page,
                        page_num,
                    )

                    page_text: str = result["text"]
                    detected_chapter: str | None = result[
                        "chapter_title"
                    ]

                    if detected_chapter:
                        current_chapter = detected_chapter

                    pages_metadata.append(
                        {
                            "page_number": page_num,
                            "chapter_title": current_chapter,
                            "text": page_text,
                        }
                    )

            else:
                chapter_map = self._detect_chapter_page_map(
                    pdf,
                    total_pages,
                )

                for p_idx in range(total_pages):
                    page_num = p_idx + 1

                    raw_page_text = pdf[p_idx].get_text()

                    page_text: str = (
                        raw_page_text
                        if isinstance(raw_page_text, str)
                        else ""
                    )

                    chapter_title: str | None = chapter_map.get(
                        page_num
                    )

                    pages_metadata.append(
                        {
                            "page_number": page_num,
                            "chapter_title": chapter_title,
                            "text": page_text,
                        }
                    )

        finally:
            pdf.close()

        return pages_metadata