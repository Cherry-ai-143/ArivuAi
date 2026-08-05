"use client";

import { Check, Loader2, RefreshCw, Save } from "lucide-react";
import type { AutoSaveStatus } from "@/types/course-builder";

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedTime: string;
  onRetry?: () => void;
}

export function AutoSaveIndicator({
  status,
  lastSavedTime,
  onRetry,
}: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {status === "saved" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" />
          Saved {lastSavedTime}
        </span>
      )}

      {status === "saving" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-[11px] font-semibold text-primary">
          <Loader2 className="size-3 animate-spin" />
          Saving...
        </span>
      )}

      {status === "unsaved" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          <Save className="size-3 text-amber-500" />
          Unsaved Changes
        </span>
      )}

      {status === "failed" && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/30 px-3 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
        >
          <RefreshCw className="size-3" />
          Auto-save failed (Retry)
        </button>
      )}
    </div>
  );
}
