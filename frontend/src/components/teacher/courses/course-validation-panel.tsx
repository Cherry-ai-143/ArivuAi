"use client";

import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import type { CourseValidationChecklist, CourseCompletionProgress } from "@/types/course-builder";

interface CourseValidationPanelProps {
  validation: CourseValidationChecklist;
  progress: CourseCompletionProgress;
  isPublished: boolean;
  onTogglePublish: () => void;
  isPublishing: boolean;
}

export function CourseValidationPanel({
  validation,
  progress,
  isPublished,
  onTogglePublish,
  isPublishing,
}: CourseValidationPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Publishing Readiness & Checklist
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-0.5 text-[11px] font-bold border ${
            isPublished
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          }`}
        >
          {isPublished ? "🟢 Published" : "🟡 Draft"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span>Course Completion</span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          {validation.hasTitle ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <AlertCircle className="size-4 text-amber-500" />
          )}
          <span className={validation.hasTitle ? "text-foreground font-semibold" : ""}>
            Course Title & Code
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          {validation.hasDescription ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <AlertCircle className="size-4 text-amber-500" />
          )}
          <span className={validation.hasDescription ? "text-foreground font-semibold" : ""}>
            Course Description
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          {validation.hasChapters ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <AlertCircle className="size-4 text-amber-500" />
          )}
          <span className={validation.hasChapters ? "text-foreground font-semibold" : ""}>
            Curriculum Chapters
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          {validation.hasLessons ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <AlertCircle className="size-4 text-amber-500" />
          )}
          <span className={validation.hasLessons ? "text-foreground font-semibold" : ""}>
            Lessons & Topics
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          {validation.hasResources ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <AlertCircle className="size-4 text-amber-500" />
          )}
          <span className={validation.hasResources ? "text-foreground font-semibold" : ""}>
            Lesson Study Materials
          </span>
        </div>
      </div>

      {/* Publish Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onTogglePublish}
          disabled={!validation.isReadyToPublish || isPublishing}
          className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all shadow-md ${
            isPublished
              ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
              : validation.isReadyToPublish
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-110"
              : "bg-muted/40 text-muted-foreground cursor-not-allowed border border-border"
          }`}
        >
          {isPublished ? "Unpublish Course (Revert to Draft)" : "Publish Course Now"}
        </button>

        {!validation.isReadyToPublish && !isPublished && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 text-center font-medium">
            Complete missing items before publishing
          </p>
        )}
      </div>
    </div>
  );
}
