"use client";

import { X, FileText, Video, FileCode, Loader2, BookOpen } from "lucide-react";
import { useResourcePreview } from "@/hooks/useQuestionBank";

interface ResourcePreviewModalProps {
  isOpen: boolean;
  lessonId: number;
  resourceId: string | null;
  onClose: () => void;
}

export function ResourcePreviewModal({
  isOpen,
  lessonId,
  resourceId,
  onClose,
}: ResourcePreviewModalProps) {
  const { data, isLoading } = useResourcePreview(
    lessonId,
    resourceId || undefined
  );

  if (!isOpen || !resourceId) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 border border-purple-600/20">
              {data?.type?.includes("PDF") ? (
                <FileText className="size-5 text-rose-500" />
              ) : data?.type?.includes("YouTube") ? (
                <Video className="size-5 text-rose-600" />
              ) : (
                <FileCode className="size-5 text-indigo-500" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{data?.title || "Resource Content Preview"}</h3>
              <p className="text-xs text-muted-foreground">
                {data?.type || "Lesson Material"} · {data?.word_count || 0} words
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-purple-600" />
              <p className="text-xs font-semibold">Extracting & loading resource content...</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/20 p-5 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {data?.text || "No text content extracted for this resource."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
