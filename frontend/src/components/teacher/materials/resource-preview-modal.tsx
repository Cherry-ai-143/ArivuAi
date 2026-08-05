"use client";

import { Eye, FileText, ExternalLink, Download, X } from "lucide-react";
import type { LessonResource } from "@/types/lesson-resource";
import { getLessonResourceDownloadUrl } from "@/lib/services/lesson-resource.service";

interface ResourcePreviewModalProps {
  isOpen: boolean;
  resource: LessonResource | null;
  onClose: () => void;
}

export function ResourcePreviewModal({
  isOpen,
  resource,
  onClose,
}: ResourcePreviewModalProps) {
  if (!isOpen || !resource) return null;

  const downloadUrl = getLessonResourceDownloadUrl(resource.lesson_id, resource.id);
  const type = (resource.resource_type || "").toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <Eye className="size-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground truncate">{resource.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Dynamic Viewer / Lightbox */}
        <div className="rounded-2xl border border-border bg-muted/20 p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
          {type.includes("pdf") ? (
            <div className="w-full h-80 rounded-xl bg-card border border-border p-4 flex flex-col items-center justify-center gap-3">
              <FileText className="size-14 text-indigo-500" />
              <p className="text-sm font-bold text-foreground">{resource.title}</p>
              <p className="text-xs text-muted-foreground">PDF Document Viewer</p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md"
              >
                <Download className="size-3.5" /> Download / Open PDF
              </a>
            </div>
          ) : type.includes("youtube") || type.includes("video") ? (
            <div className="w-full h-80 rounded-xl bg-black flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Video Player Placeholder / Stream</p>
            </div>
          ) : resource.url ? (
            <div className="space-y-3">
              <ExternalLink className="mx-auto size-12 text-emerald-500" />
              <p className="text-sm font-bold text-foreground">External Resource Link</p>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md"
              >
                <ExternalLink className="size-3.5" /> Open Link in New Tab
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <FileText className="mx-auto size-12 text-primary" />
              <p className="text-sm font-bold text-foreground">Document File</p>
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md"
              >
                <Download className="size-3.5" /> Download File
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Type: <span className="font-semibold text-foreground">{resource.resource_type}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-md"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
