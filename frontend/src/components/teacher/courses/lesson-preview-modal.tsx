"use client";

import { Clock, Eye, FileText, Play, X, Zap } from "lucide-react";
import type { Lesson } from "@/types/lesson";

interface LessonPreviewModalProps {
  isOpen: boolean;
  lesson: Lesson | null;
  onClose: () => void;
}

export function LessonPreviewModal({
  isOpen,
  lesson,
  onClose,
}: LessonPreviewModalProps) {
  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Eye className="size-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Student Lesson Preview
              </span>
              <h3 className="text-xl font-bold text-foreground truncate">{lesson.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <span className="rounded-lg bg-primary/10 text-primary px-3 py-1 border border-primary/20">
              Type: {lesson.type || "Theory"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-muted-foreground" />
              {lesson.duration_minutes || 45} mins
            </span>
            <span className="rounded-lg bg-emerald-500/10 text-emerald-600 px-3 py-1 border border-emerald-500/20">
              {lesson.is_published ? "Published" : "Draft"}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Lesson Summary
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lesson.description || "No description provided for this lesson."}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              Study Resources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/50">
                <FileText className="size-4 text-primary" />
                <span className="font-semibold text-foreground">Lecture Guide PDF</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/50">
                <Play className="size-4 text-accent" />
                <span className="font-semibold text-foreground">Video Lecture</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-accent" />
              <div>
                <p className="text-xs font-bold text-foreground">AI Interactive Quiz</p>
                <p className="text-[11px] text-muted-foreground">Unlocked after lesson completion</p>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground opacity-80 cursor-not-allowed"
            >
              Start Quiz
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
