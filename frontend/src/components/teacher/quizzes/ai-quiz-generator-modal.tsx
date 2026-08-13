"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  X,
  Brain,
  Check,
  FileText,
  Loader2,
  AlertTriangle,
  Clock,
  BookOpen,
  CheckSquare,
  Square,
  Save,
  Video,
  FileCode,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  History,
  Tag,
  BarChart2,
  Trash2,
  ChevronDown,
  BookMarked,
} from "lucide-react";
import {
  useLessonAiResources,
  useGenerateAiPreview,
  useGenerationJobStatus,
  useReviewCandidateQuestion,
  useApproveAiQuestions,
  useRetryAiJob,
} from "@/hooks/useQuestionBank";
import { ResourcePreviewModal } from "./resource-preview-modal";
import { GenerationHistoryDrawer } from "./generation-history-drawer";
import type { BloomLevel, CandidateQuestion, DiscoveredChapter } from "@/types/question";

// ─── Chapter Scroll Dropdown ───────────────────────────────────────────────────
// purpose : Replace native <select> with a fully scrollable, keyboard-accessible
//           custom dropdown that shows all discovered PDF chapters with page metadata.
interface ChapterScrollDropdownProps {
  chapters: DiscoveredChapter[];
  selectedChapterTitle: string;
  onSelect: (title: string) => void;
  activeChapter: DiscoveredChapter | null;
}

function ChapterScrollDropdown({
  chapters,
  selectedChapterTitle,
  onSelect,
  activeChapter,
}: ChapterScrollDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const displayTitle = selectedChapterTitle || (chapters[0]?.title ?? "Select a Chapter");

  return (
    <div className="space-y-2 pt-2 border-t border-indigo-500/20">
      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
        Select Chapter
      </label>

      {/* Trigger button */}
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          id="chapter-dropdown-trigger"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-colors"
        >
          <span className="flex items-center gap-2 min-w-0 truncate">
            <BookMarked className="size-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{displayTitle}</span>
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
              {chapters.length} chapters
            </span>
            <ChevronDown
              className={`size-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {/* Scrollable chapter list */}
        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            <div
              id="chapter-dropdown-list"
              className="max-h-64 overflow-y-auto overscroll-contain divide-y divide-border/50"
            >
              {chapters.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  No chapters found
                </div>
              ) : (
                chapters.map((ch) => {
                  const isSelected = ch.title === selectedChapterTitle;
                  return (
                    <button
                      key={ch.title}
                      type="button"
                      onClick={() => {
                        onSelect(ch.title);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/60 ${
                        isSelected
                          ? "bg-indigo-500/10 text-indigo-700 font-extrabold"
                          : "text-foreground font-semibold"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {isSelected ? (
                          <Check className="size-3 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <span className="size-3 flex-shrink-0" />
                        )}
                        <span className="text-xs truncate">{ch.title}</span>
                      </span>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 text-[10px] font-bold whitespace-nowrap">
                          pp.{ch.start_page}–{ch.end_page}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px] font-bold whitespace-nowrap">
                          {ch.word_count.toLocaleString()} w
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active chapter metadata badges */}
      {activeChapter && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 font-bold">
            Pages: {activeChapter.start_page}–{activeChapter.end_page}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 font-bold">
            Chunks: {activeChapter.chunk_count}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 font-bold">
            Context: {activeChapter.word_count.toLocaleString()} words
          </span>
        </div>
      )}
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────────

interface AiQuizGeneratorModalProps {
  isOpen: boolean;
  lessonId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}


export function AiQuizGeneratorModal({
  isOpen,
  lessonId = 1,
  onClose,
  onSuccess,
}: AiQuizGeneratorModalProps) {
  const [step, setStep] = useState<number>(1);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Preset Selection
  const [preset, setPreset] = useState<"practice" | "exam" | "custom">("custom");

  // Resource Discovery Hook
  const { data: discoveryData, isLoading: isLoadingDiscovery } = useLessonAiResources(lessonId);

  // Preview & History Drawer Modals
  const [previewResourceId, setPreviewResourceId] = useState<string | null>(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Configuration State
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficultyDist, setDifficultyDist] = useState<string>("Medium");
  const [typeDist, setTypeDist] = useState<string>("Multiple Choice");
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>("Understanding");

  // Topic Coverage State
  const [availableTopics] = useState<string[]>([
    "Variables & Data Types",
    "Control Flow & Loops",
    "Functions & Scope",
    "File Handling & I/O",
    "Exception Handling",
  ]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(availableTopics));

  // Selected Resources State
  const [selectedResourceIds, setSelectedResourceIds] = useState<Set<string>>(new Set());

  // purpose : Manage selected source material type (Lesson Overview, YouTube, or Course PDF Textbook).
  const [sourceType, setSourceType] = useState<"overview" | "youtube" | "pdf">("youtube");

  // purpose : Track selected PDF textbook resource ID and chapter scope selection.
  const [selectedPdfId, setSelectedPdfId] = useState<number | null>(null);
  const [pdfScopeMode, setPdfScopeMode] = useState<"entire" | "chapter">("chapter");
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>("");

  useEffect(() => {
    if (discoveryData?.resources) {
      const initialSet = new Set<string>();
      discoveryData.resources.forEach((r) => {
        if (r.enabled_by_default) initialSet.add(r.id);
      });
      setSelectedResourceIds(initialSet);

      const pdfRes = discoveryData.resources.find((r) => r.pdf_id || r.type.includes("PDF"));
      if (pdfRes) {
        setSelectedPdfId(pdfRes.pdf_id || pdfRes.db_id || null);
        if (pdfRes.chapters && pdfRes.chapters.length > 0) {
          setSelectedChapterTitle(pdfRes.chapters[0].title);
        }
      }

      if (discoveryData.has_pdf && !discoveryData.has_youtube) {
        setSourceType("pdf");
      }
    }
  }, [discoveryData]);

  // purpose : Lookup discovered PDF resources and currently active selected chapter.
  const pdfResources = discoveryData?.resources.filter((r) => r.pdf_id || r.type.includes("PDF")) || [];
  const activePdfResource = pdfResources.find((r) => (r.pdf_id || r.db_id) === selectedPdfId) || pdfResources[0] || null;
  const activeChapter = activePdfResource?.chapters?.find((ch) => ch.title === selectedChapterTitle) || activePdfResource?.chapters?.[0] || null;

  // Handle Preset Switching
  const handleSelectPreset = (selectedPreset: "practice" | "exam" | "custom") => {
    setPreset(selectedPreset);
    if (selectedPreset === "practice") {
      setNumQuestions(10);
      setTypeDist("MULTIPLE_CHOICE");
    } else if (selectedPreset === "exam") {
      setNumQuestions(30);
      setTypeDist("MIXED");
    }
  };

  // Hooks
  const generatePreviewMutation = useGenerateAiPreview();
  const reviewQuestionMutation = useReviewCandidateQuestion();
  const approveMutation = useApproveAiQuestions();
  const retryMutation = useRetryAiJob();

  const { data: jobStatusData } = useGenerationJobStatus(
    lessonId,
    activeJobId || undefined,
    Boolean(activeJobId)
  );

  const handleRetryJob = async () => {
    if (!activeJobId) return;
    try {
      await retryMutation.mutateAsync({ lessonId, jobId: activeJobId });
      showToast("success", "Resuming generation job...");
    } catch (e) {
      showToast("error", "Failed to resume generation job.");
    }
  };

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editTextMap, setEditTextMap] = useState<Record<number, string>>({});

  if (!isOpen) return null;

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleResource = (id: string) => {
    setSelectedResourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  // Launch AI Generation Job
  // purpose : Construct request payload with selected source material, PDF ID, and chapter scope parameters.
  const handleStartGeneration = async () => {
    try {
      setStep(2); // Progress screen

      const reqPayload: any = {
        num_questions: numQuestions,
        difficulty_dist: difficultyDist,
        type_dist: typeDist,
        bloom_level: bloomLevel,
        selected_resource_ids: Array.from(selectedResourceIds),
        include_description: sourceType === "overview" || selectedResourceIds.has(`desc_${lessonId}`),
      };

      if (sourceType === "pdf" && selectedPdfId) {
        reqPayload.selected_pdf_id = selectedPdfId;
        if (pdfScopeMode === "chapter" && selectedChapterTitle) {
          reqPayload.selected_chapter_title = selectedChapterTitle;
          if (activeChapter) {
            reqPayload.start_page = activeChapter.start_page;
            reqPayload.end_page = activeChapter.end_page;
          }
        }
      }

      const res = await generatePreviewMutation.mutateAsync({
        lessonId,
        request: reqPayload,
      });

      setActiveJobId(res.job_id);
    } catch (err: any) {
      console.error("AI Generation error:", err);
      showToast("error", "Failed to start AI generation job.");
      setStep(1);
    }
  };

  const isFailedState = jobStatusData?.job_status === "FAILED";

  // Transition to Review when ready
  if (step === 2 && jobStatusData?.job_status === "READY_FOR_REVIEW") {
    setStep(3);
  }

  // Resume History Job
  const handleResumeHistoryJob = (jobId: string) => {
    setActiveJobId(jobId);
    setStep(3);
  };

  // Candidate Question Actions
  const handleToggleApprove = async (tempQ: CandidateQuestion) => {
    try {
      await reviewQuestionMutation.mutateAsync({
        lessonId,
        tempQuestionId: tempQ.id,
        updateData: { approved: !tempQ.approved },
      });
    } catch (e) {
      showToast("error", "Failed to update question status.");
    }
  };

  const handleSaveInlineEdit = async (tempQ: CandidateQuestion) => {
    const updatedText = editTextMap[tempQ.id];
    if (updatedText && updatedText.trim()) {
      try {
        await reviewQuestionMutation.mutateAsync({
          lessonId,
          tempQuestionId: tempQ.id,
          updateData: { question_text: updatedText.trim() },
        });
        setEditingQuestionId(null);
        showToast("success", "Updated question text.");
      } catch (e) {
        showToast("error", "Failed to save edit.");
      }
    }
  };

  const handleApproveAll = async () => {
    if (!jobStatusData?.questions) return;
    for (const q of jobStatusData.questions) {
      if (!q.approved) {
        await reviewQuestionMutation.mutateAsync({
          lessonId,
          tempQuestionId: q.id,
          updateData: { approved: true },
        });
      }
    }
  };

  const handleRejectAll = async () => {
    if (!jobStatusData?.questions) return;
    for (const q of jobStatusData.questions) {
      if (q.approved) {
        await reviewQuestionMutation.mutateAsync({
          lessonId,
          tempQuestionId: q.id,
          updateData: { approved: false },
        });
      }
    }
  };

  const handleSaveApprovedToQuestionBank = async () => {
    if (!activeJobId) return;
    try {
      const res = await approveMutation.mutateAsync({
        lessonId,
        jobId: activeJobId,
      });
      showToast("success", res.message);
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", "Failed to persist approved questions to Question Bank.");
    }
  };

  const candidateQuestions = jobStatusData?.questions || [];
  const approvedCount = candidateQuestions.filter((q) => q.approved).length;
  const pendingCount = candidateQuestions.filter((q) => !q.approved && !q.rejected_reason).length;
  const rejectedCount = candidateQuestions.filter((q) => q.rejected_reason).length;
  const avgConfidence = candidateQuestions.length
    ? Math.round(candidateQuestions.reduce((acc, q) => acc + q.ai_confidence, 0) / candidateQuestions.length)
    : 94;

  const totalWords = discoveryData?.total_words || 0;
  const estimatedTokens = Math.round(totalWords * 0.78);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 border border-purple-600/20">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-foreground">
                AI Question Authoring Workspace
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Context: Lesson ID #{lessonId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <History className="size-3.5 text-purple-600" /> Past Jobs
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 flex-shrink-0 ${toastMsg.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}
          >
            {toastMsg.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* STEP 1: CONFIGURATION, PRESETS, RESOURCE SELECTION & TOPIC COVERAGE */}
        {step === 1 && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Presets Header */}
            <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-2xl border border-border">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Authoring Preset:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset("practice")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${preset === "practice" ? "bg-purple-600 text-white shadow-xs" : "bg-card text-foreground border border-border hover:bg-muted"
                    }`}
                >
                  Practice Quiz (10 Qs)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("exam")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${preset === "exam" ? "bg-purple-600 text-white shadow-xs" : "bg-card text-foreground border border-border hover:bg-muted"
                    }`}
                >
                  Final Exam (30 Qs)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("custom")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${preset === "custom" ? "bg-purple-600 text-white shadow-xs" : "bg-card text-foreground border border-border hover:bg-muted"
                    }`}
                >
                  Custom Configuration
                </button>
              </div>
            </div>

            {/* SOURCE MATERIAL SELECTION */}
            {/* purpose : Render Source Material selector (Lesson Overview, YouTube Video, Course Textbook PDF) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Source Material
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSourceType("overview")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    sourceType === "overview"
                      ? "border-purple-600 bg-purple-600/10 text-purple-600 ring-1 ring-purple-600/30 font-extrabold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileCode className="size-4" /> Lesson Overview
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("youtube")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    sourceType === "youtube"
                      ? "border-purple-600 bg-purple-600/10 text-purple-600 ring-1 ring-purple-600/30 font-extrabold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Video className="size-4 text-rose-500" /> YouTube Video
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("pdf")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    sourceType === "pdf"
                      ? "border-purple-600 bg-purple-600/10 text-purple-600 ring-1 ring-purple-600/30 font-extrabold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileText className="size-4 text-indigo-500" /> Course Textbook PDF
                </button>
              </div>
            </div>

            {/* GENERATION SCOPE FOR COURSE TEXTBOOK PDF */}
            {/* purpose : Render Generation Scope selector for Course Textbook PDF (Entire Textbook vs Selected Chapter) */}
            {sourceType === "pdf" && (
              <div className="space-y-3 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="size-4 text-indigo-600" /> Uploaded Course Textbook PDF
                  </span>
                  {pdfResources.length > 1 && (
                    <select
                      value={selectedPdfId || ""}
                      onChange={(e) => {
                        const pid = Number(e.target.value);
                        setSelectedPdfId(pid);
                        const match = pdfResources.find((r) => (r.pdf_id || r.db_id) === pid);
                        if (match?.chapters && match.chapters.length > 0) {
                          setSelectedChapterTitle(match.chapters[0].title);
                        }
                      }}
                      className="rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground"
                    >
                      {pdfResources.map((p) => (
                        <option key={p.id} value={p.pdf_id || p.db_id}>
                          {p.title} ({p.total_pages || 0} pages)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {activePdfResource ? (
                  <div className="p-2.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 text-indigo-500 flex-shrink-0" />
                      <span className="font-bold text-foreground truncate">{activePdfResource.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                      {activePdfResource.detail}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    No course textbook PDF detected. Upload a PDF to the course to enable chapter-scoped generation.
                  </div>
                )}

                {activePdfResource && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                        Generation Scope
                      </label>
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pdfScope"
                            checked={pdfScopeMode === "entire"}
                            onChange={() => setPdfScopeMode("entire")}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Entire Textbook</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pdfScope"
                            checked={pdfScopeMode === "chapter"}
                            onChange={() => setPdfScopeMode("chapter")}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Selected Chapter</span>
                        </label>
                      </div>
                    </div>

                    {pdfScopeMode === "chapter" && (
                      <ChapterScrollDropdown
                        chapters={activePdfResource?.chapters || []}
                        selectedChapterTitle={selectedChapterTitle}
                        onSelect={setSelectedChapterTitle}
                        activeChapter={activeChapter}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Discovered Lesson Resources Checkboxes with Badges & Preview Button */}
            {sourceType !== "pdf" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Lesson Materials & Cache Status
                </label>

                {isLoadingDiscovery ? (
                  <div className="flex items-center gap-2 p-4 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-purple-600" />
                    <span>Discovering attached lesson resources...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {discoveryData?.resources.map((r) => {
                      const isChecked = selectedResourceIds.has(r.id);
                      return (
                        <div
                          key={r.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${isChecked ? "border-purple-600 bg-purple-600/5 ring-1 ring-purple-600/30" : "border-border bg-card"
                            }`}
                        >
                          <div
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                            onClick={() => handleToggleResource(r.id)}
                          >
                            {r.type.includes("PDF") ? (
                              <FileText className="size-4 text-rose-500 flex-shrink-0" />
                            ) : r.type.includes("YouTube") ? (
                              <Video className="size-4 text-rose-600 flex-shrink-0" />
                            ) : (
                              <FileCode className="size-4 text-indigo-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground truncate">{r.title}</p>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-bold">
                                  ✓ Cached
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{r.detail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewResourceId(r.id)}
                              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="Preview Content"
                            >
                              <Eye className="size-3.5" />
                            </button>
                            <button type="button" onClick={() => handleToggleResource(r.id)}>
                              {isChecked ? (
                                <CheckSquare className="size-4 text-purple-600" />
                              ) : (
                                <Square className="size-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Topic Coverage Detection Controls */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="size-3.5 text-purple-600" /> Detected Topic Coverage (Target Topics)
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {availableTopics.map((topic) => {
                  const isSelected = selectedTopics.has(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleToggleTopic(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${isSelected
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                    >
                      {isSelected ? "✓ " : ""}{topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Context & Prompt Preview Box */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5 text-purple-600">
                  <Brain className="size-4" /> AI Prompt & Context Summary
                </span>
                <span className="text-muted-foreground">
                  {totalWords} words · ~{estimatedTokens} tokens · ~{discoveryData?.estimated_duration_sec || 18}s
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Gemini AI will read selected PDF documents, video transcripts, and lesson overview notes to generate {numQuestions} questions focused on {selectedTopics.size} topics mapped to Bloom's taxonomy.
              </p>
            </div>

            {/* Generation Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 border border-border/60 p-4 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Question Count (5-50)
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center rounded-xl border border-border bg-card p-1">
                    <button
                      type="button"
                      onClick={() => setNumQuestions((prev) => Math.max(5, prev - 1))}
                      className="size-8 rounded-lg bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center font-bold text-base transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-foreground">
                      {numQuestions}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumQuestions((prev) => Math.min(50, prev + 1))}
                      className="size-8 rounded-lg bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center font-bold text-base transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[5, 10, 15, 25, 50].map((presetVal) => (
                      <button
                        key={presetVal}
                        type="button"
                        onClick={() => setNumQuestions(presetVal)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          numQuestions === presetVal
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {presetVal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Question Type
                </label>
                <select
                  value={typeDist}
                  onChange={(e) => setTypeDist(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="FILL_BLANK">Fill in the Blanks</option>
                  <option value="MIXED">Mixed (MCQ, True/False, Fill in Blank)</option>
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartGeneration}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all"
              >
                <Sparkles className="size-4" /> Start AI Generation ({numQuestions} Qs)
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STATE MACHINE PROGRESS & ACTION TIMELINE */}
        {step === 2 && (
          <div className="p-8 flex flex-col items-center justify-center space-y-6 flex-1">
            {isFailedState ? (
              <div className="max-w-md w-full p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-4 text-center">
                <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    Generation Interrupted
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {jobStatusData?.failure_reason || "Google Gemini AI is currently experiencing high demand. All previous chunks have been preserved."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Adjust Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleRetryJob}
                    disabled={retryMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {retryMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                    Resume From Chunk {jobStatusData?.current_chunk || 1}
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-lg w-full space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="size-8 animate-spin text-purple-600" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      AI Question Authoring Engine
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Status: <span className="font-bold text-purple-600">{jobStatusData?.job_status || "RUNNING"}</span> · Stage: <span className="font-bold text-indigo-600">{jobStatusData?.stage || "GENERATING"}</span>
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Time Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-purple-600 uppercase tracking-wider">
                      Progress: {jobStatusData?.progress || 10}%
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {jobStatusData?.elapsed_time || "0 sec"} elapsed · ~{jobStatusData?.estimated_remaining || "15 sec"} remaining
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 rounded-full"
                      style={{ width: `${jobStatusData?.progress || 10}%` }}
                    />
                  </div>
                </div>

                {/* Action-Oriented Timeline */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-600 font-bold">
                      ✓ Reading Lesson Resources
                    </span>
                    <span className="text-[10px] text-muted-foreground">Done</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-600 font-bold">
                      ✓ Extracting & Caching Materials
                    </span>
                    <span className="text-[10px] text-muted-foreground">Done</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-600 font-bold">
                      ✓ Token Section Chunking (4000 target / 250 overlap)
                    </span>
                    <span className="text-[10px] text-muted-foreground">Done</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-y border-border/50">
                    <span className="flex items-center gap-2 text-purple-600 font-bold">
                      <Loader2 className="size-3.5 animate-spin" /> Chunk {jobStatusData?.current_chunk || 1} / {jobStatusData?.total_chunks || 1} · Generating Questions with Gemini
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      ◯ Deduplication & Quality Validation
                    </span>
                    <span className="text-[10px]">Pending</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      ◯ Preparing Item Bank Review Session
                    </span>
                    <span className="text-[10px]">Pending</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: STREAMLINED REVIEW & STATS BAR */}
        {step === 3 && (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            {/* Streamlined Stats Header Bar */}
            <div className="grid grid-cols-5 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border text-center text-xs">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Generated</p>
                <p className="text-sm font-bold text-foreground">{candidateQuestions.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-600 uppercase font-bold">Approved</p>
                <p className="text-sm font-bold text-emerald-600">{approvedCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-amber-600 uppercase font-bold">Pending</p>
                <p className="text-sm font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-rose-600 uppercase font-bold">Rejected</p>
                <p className="text-sm font-bold text-rose-600">{rejectedCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-purple-600 uppercase font-bold">Avg Confidence</p>
                <p className="text-sm font-bold text-purple-600">{avgConfidence}%</p>
              </div>
            </div>

            {/* Batch Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-foreground">Item Bank Candidate Cards</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApproveAll}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20"
                >
                  Approve All
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20"
                >
                  Reject All
                </button>
              </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1">
              {candidateQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-4 transition-all space-y-3 ${q.approved ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card opacity-65"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="size-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                        {q.bloom_level}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                        Confidence: {q.ai_confidence}%
                      </span>
                      {q.source_attribution && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-bold">
                          Source: {q.source_attribution}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleApprove(q)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${q.approved ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {q.approved ? <Check className="size-3.5" /> : <XCircle className="size-3.5" />}
                      {q.approved ? "Approved" : "Rejected"}
                    </button>
                  </div>

                  {editingQuestionId === q.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={editTextMap[q.id] ?? q.question_text}
                        onChange={(e) => setEditTextMap({ ...editTextMap, [q.id]: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-primary bg-card text-xs text-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveInlineEdit(q)}
                        className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                      >
                        Save Text Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-foreground leading-relaxed">{q.question_text}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuestionId(q.id);
                          setEditTextMap({ ...editTextMap, [q.id]: q.question_text });
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  )}

                  {q.question_type === "FILL_BLANK" || q.correct_answer ? (
                    <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 block mb-0.5">Correct Answer:</span>
                      {q.correct_answer || q.option_a}
                    </div>
                  ) : q.question_type === "TRUE_FALSE" ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2.5 rounded-xl border ${q.correct_option === "a" ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700" : "border-border"}`}>
                        A: True
                      </div>
                      <div className={`p-2.5 rounded-xl border ${q.correct_option === "b" ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700" : "border-border"}`}>
                        B: False
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`p-2.5 rounded-xl border ${q.correct_option === "a" ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700" : "border-border"}`}>
                        A: {q.option_a}
                      </div>
                      <div className={`p-2.5 rounded-xl border ${q.correct_option === "b" ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700" : "border-border"}`}>
                        B: {q.option_b}
                      </div>
                      <div className={`p-2.5 rounded-xl border ${q.correct_option === "c" ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700" : "border-border"}`}>
                        C: {q.option_c}
                      </div>
                      <div className={`p-2.5 rounded-xl border ${q.correct_option === "d" ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700" : "border-border"}`}>
                        D: {q.option_d}
                      </div>
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-[11px] text-muted-foreground italic border-t border-border/50 pt-2">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Persistence */}
            <div className="pt-4 border-t border-border flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Back to Configuration
              </button>

              <button
                type="button"
                onClick={handleSaveApprovedToQuestionBank}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition-all"
              >
                <Save className="size-4" /> Save Approved Questions ({approvedCount})
              </button>
            </div>
          </div>
        )}

        {/* Resource Content Preview Modal */}
        <ResourcePreviewModal
          isOpen={Boolean(previewResourceId)}
          lessonId={lessonId}
          resourceId={previewResourceId}
          onClose={() => setPreviewResourceId(null)}
        />

        {/* Past Jobs Generation History Drawer */}
        <GenerationHistoryDrawer
          isOpen={isHistoryDrawerOpen}
          lessonId={lessonId}
          onClose={() => setIsHistoryDrawerOpen(false)}
          onResumeJob={handleResumeHistoryJob}
        />
      </div>
    </div>
  );
}
