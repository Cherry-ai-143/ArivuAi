"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import type { Chapter } from "@/types/chapter";

interface ChapterModalProps {
  isOpen: boolean;
  chapter: Chapter | null;
  courseId: number;
  onClose: () => void;
  onSave: (data: { title: string; description?: string; order_number: number }) => Promise<void>;
  isSaving: boolean;
}

export function ChapterModal({
  isOpen,
  chapter,
  onClose,
  onSave,
  isSaving,
}: ChapterModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderNumber, setOrderNumber] = useState(1);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title || "");
      setDescription(chapter.description || "");
      setOrderNumber(chapter.order_number || 1);
    } else {
      setTitle("");
      setDescription("");
      setOrderNumber(1);
    }
    setValidationError("");
  }, [chapter, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!title.trim() || title.trim().length < 3) {
      setValidationError("Chapter title must be at least 3 characters.");
      return;
    }

    if (orderNumber < 1) {
      setValidationError("Order number must be 1 or greater.");
      return;
    }

    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      order_number: orderNumber,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-bold text-foreground">
            {chapter ? "Edit Chapter" : "Add New Chapter"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {validationError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Chapter Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 1: Introduction to Data Structures"
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of concepts covered in this chapter..."
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Display Order Number
            </label>
            <input
              type="number"
              min={1}
              value={orderNumber}
              onChange={(e) => setOrderNumber(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  {chapter ? "Save Changes" : "Create Chapter"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
