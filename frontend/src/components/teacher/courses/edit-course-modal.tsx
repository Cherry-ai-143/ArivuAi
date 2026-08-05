"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X, AlertCircle } from "lucide-react";
import type { Course, UpdateCourseRequest } from "@/types/course";

interface EditCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSave: (courseId: number, data: UpdateCourseRequest) => Promise<void>;
  isSaving: boolean;
}

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Master"];

export function EditCourseModal({
  isOpen,
  course,
  onClose,
  onSave,
  isSaving,
}: EditCourseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState("English");
  const [durationHours, setDurationHours] = useState(10);
  const [isPublished, setIsPublished] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
      setLevel(course.level || "Beginner");
      setLanguage(course.language || "English");
      setDurationHours(course.duration_hours || 10);
      setIsPublished(Boolean(course.is_published));
      setShowUnsavedPrompt(false);
      setValidationError("");
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const isDirty =
    title !== (course.title || "") ||
    description !== (course.description || "") ||
    level !== (course.level || "Beginner") ||
    language !== (course.language || "English") ||
    durationHours !== (course.duration_hours || 10) ||
    isPublished !== Boolean(course.is_published);

  const handleRequestClose = () => {
    if (isDirty && !showUnsavedPrompt) {
      setShowUnsavedPrompt(true);
    } else {
      setShowUnsavedPrompt(false);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!title.trim() || title.trim().length < 3) {
      setValidationError("Course title must be at least 3 characters.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setValidationError("Course description must be at least 10 characters.");
      return;
    }

    if (durationHours <= 0) {
      setValidationError("Duration must be greater than 0 hours.");
      return;
    }

    const mapLevelToBackendEnum = (lvl: string): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" => {
      const l = lvl.toUpperCase();
      if (l.includes("BEGINNER")) return "BEGINNER";
      if (l.includes("INTERMEDIATE")) return "INTERMEDIATE";
      return "ADVANCED";
    };

    await onSave(course.id, {
      title: title.trim(),
      description: description.trim(),
      level: mapLevelToBackendEnum(level),
      language: language.trim(),
      duration_hours: durationHours,
      is_published: isPublished,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {showUnsavedPrompt ? (
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 text-amber-500 font-bold">
            <AlertCircle className="size-5" />
            Unsaved Changes
          </div>
          <p className="text-xs text-muted-foreground">
            You have unsaved changes in this course. Are you sure you want to discard them?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowUnsavedPrompt(false)}
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Continue Editing
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUnsavedPrompt(false);
                onClose();
              }}
              className="rounded-xl bg-destructive px-3.5 py-2 text-xs font-semibold text-destructive-foreground hover:brightness-110"
            >
              Discard Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Edit Course</h2>
              <p className="text-xs text-muted-foreground">Update course details and publication status</p>
            </div>
            <button
              type="button"
              onClick={handleRequestClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
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
                Course Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border pt-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Publication Status</p>
                <p className="text-xs text-muted-foreground">Publish to make visible to students</p>
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleRequestClose}
                disabled={isSaving}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
