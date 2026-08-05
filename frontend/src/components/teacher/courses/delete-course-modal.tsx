"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import type { Course } from "@/types/course";

interface DeleteCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onConfirm: (courseId: number) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteCourseModal({
  isOpen,
  course,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteCourseModalProps) {
  if (!isOpen || !course) return null;

  const handleDelete = async () => {
    await onConfirm(course.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Delete &quot;{course.title}&quot;?
            </h3>
            <p className="text-xs text-muted-foreground">Action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Are you sure you want to permanently delete this course? All associated chapters,
          lessons, and uploaded resources will also be deleted from Arivu AI.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-xs font-semibold text-destructive-foreground shadow-md hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Course"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
