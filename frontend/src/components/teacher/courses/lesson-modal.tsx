"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import type { Lesson, LessonType } from "@/types/lesson";

interface LessonModalProps {
  isOpen: boolean;
  lesson: Lesson | null;
  chapterId: number;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    order_number: number;
    duration_minutes?: number;
    type?: LessonType;
    is_published?: boolean;
  }) => Promise<void>;
  isSaving: boolean;
}

const LESSON_TYPES: LessonType[] = ["Theory", "Practical", "Lab", "Seminar", "Workshop"];

export function LessonModal({
  isOpen,
  lesson,
  onClose,
  onSave,
  isSaving,
}: LessonModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderNumber, setOrderNumber] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [type, setType] = useState<LessonType>("Theory");
  const [isPublished, setIsPublished] = useState(true);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || "");
      setDescription(lesson.description || "");
      setOrderNumber(lesson.order_number || 1);
      setDurationMinutes(lesson.duration_minutes || 45);
      setType(lesson.type || "Theory");
      setIsPublished(Boolean(lesson.is_published));
    } else {
      setTitle("");
      setDescription("");
      setOrderNumber(1);
      setDurationMinutes(45);
      setType("Theory");
      setIsPublished(true);
    }
    setValidationError("");
  }, [lesson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!title.trim() || title.trim().length < 3) {
      setValidationError("Lesson title must be at least 3 characters.");
      return;
    }

    if (durationMinutes <= 0) {
      setValidationError("Duration must be greater than 0 minutes.");
      return;
    }

    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      order_number: orderNumber,
      duration_minutes: durationMinutes,
      type,
      is_published: isPublished,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-bold text-foreground">
            {lesson ? "Edit Lesson Details" : "Add New Lesson"}
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
              Lesson Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Memory Layout & Contiguous Allocation"
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Description / Summary
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of topics, code examples, or key takeaways..."
              className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Lesson Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LessonType)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              >
                {LESSON_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border pt-4">
            <div>
              <p className="text-xs font-semibold text-foreground">Published Status</p>
              <p className="text-[11px] text-muted-foreground">Visible to enrolled students</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none" />
            </label>
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
                  {lesson ? "Save Lesson" : "Create Lesson"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
