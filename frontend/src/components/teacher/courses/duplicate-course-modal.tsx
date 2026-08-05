"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, X } from "lucide-react";

interface DuplicateCourseModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType?: "Course" | "Chapter" | "Lesson";
  onClose: () => void;
  onConfirm: (newTitle: string) => Promise<void>;
  isDuplicating: boolean;
}

export function DuplicateCourseModal({
  isOpen,
  itemTitle,
  itemType = "Course",
  onClose,
  onConfirm,
  isDuplicating,
}: DuplicateCourseModalProps) {
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (itemTitle) {
      setNewTitle(`${itemTitle} (Copy)`);
    }
  }, [itemTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onConfirm(newTitle.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Copy className="size-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Duplicate {itemType}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              New {itemType} Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isDuplicating}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDuplicating || !newTitle.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-50"
            >
              {isDuplicating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Duplicate {itemType}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
