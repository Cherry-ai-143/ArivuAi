"use client";

import { X, History, Clock, CheckCircle2, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useGenerationHistory } from "@/hooks/useQuestionBank";

interface GenerationHistoryDrawerProps {
  isOpen: boolean;
  lessonId: number;
  onClose: () => void;
  onResumeJob: (jobId: string) => void;
}

export function GenerationHistoryDrawer({
  isOpen,
  lessonId,
  onClose,
  onResumeJob,
}: GenerationHistoryDrawerProps) {
  const { data: historyList, isLoading } = useGenerationHistory(lessonId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md h-full border-l border-border bg-card shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="size-5 text-purple-600" />
            <h3 className="text-sm font-bold text-foreground">AI Generation History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-purple-600" />
              <p className="text-xs font-semibold">Loading past generation jobs...</p>
            </div>
          ) : !historyList || historyList.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <Sparkles className="size-8 mx-auto text-purple-400 opacity-60" />
              <p className="font-semibold">No past AI generation jobs found for this lesson.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((job) => (
                <div
                  key={job.job_id}
                  className="rounded-2xl border border-border p-4 hover:border-purple-500/40 bg-card hover:bg-purple-500/5 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                      {job.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-foreground">
                    {job.approved_questions} / {job.total_questions} Questions Approved
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{job.progress_message}</p>

                  <button
                    type="button"
                    onClick={() => {
                      onResumeJob(job.job_id);
                      onClose();
                    }}
                    className="w-full mt-2 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-purple-700 transition-all"
                  >
                    Resume Review <ArrowRight className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
