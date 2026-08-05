"use client";

import { CheckSquare, Trash2, Copy, Eye, X } from "lucide-react";

interface BulkToolbarProps {
  count: number;
  onClear: () => void;
  onDeleteSelected: () => void;
  onPublishSelected?: () => void;
  onDuplicateSelected?: () => void;
}

export function BulkToolbar({
  count,
  onClear,
  onDeleteSelected,
  onPublishSelected,
  onDuplicateSelected,
}: BulkToolbarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full border border-border bg-card/95 backdrop-blur-md px-5 py-2.5 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground border-r border-border pr-3">
        <CheckSquare className="size-4 text-primary" />
        <span>{count} Selected</span>
      </div>

      <div className="flex items-center gap-2">
        {onPublishSelected && (
          <button
            type="button"
            onClick={onPublishSelected}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          >
            <Eye className="size-3.5" />
            Publish Selected
          </button>
        )}

        {onDuplicateSelected && (
          <button
            type="button"
            onClick={onDuplicateSelected}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20"
          >
            <Copy className="size-3.5" />
            Duplicate
          </button>
        )}

        <button
          type="button"
          onClick={onDeleteSelected}
          className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/20"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="p-1 text-muted-foreground hover:text-foreground rounded-full"
        title="Deselect All"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
