"use client";

import { Eye, BookOpen, Clock, Users, Star, FileText, Play, X, Zap, CheckCircle2 } from "lucide-react";
import type { Course } from "@/types/course";
import type { Chapter } from "@/types/chapter";

interface CourseLivePreviewModalProps {
  isOpen: boolean;
  course: Course | null;
  chapters?: Chapter[];
  onClose: () => void;
}

export function CourseLivePreviewModal({
  isOpen,
  course,
  chapters = [],
  onClose,
}: CourseLivePreviewModalProps) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl h-[90vh] max-h-[900px] rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="relative h-44 bg-gradient-to-r from-primary/20 via-indigo-600/20 to-accent/20 border-b border-border p-6 flex items-end justify-between flex-shrink-0">
          <div className="space-y-1">
            <span className="rounded-md bg-accent px-2.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              Student View Mode (Read Only)
            </span>
            <h2 className="text-2xl font-bold text-foreground">{course.title}</h2>
            <p className="text-xs text-muted-foreground line-clamp-1">{course.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-card/80 p-2 text-foreground hover:bg-card shadow-md"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-border bg-muted/20 p-4 text-xs font-semibold">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Level</span>
              <span className="text-foreground">{course.level || "Beginner"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Duration</span>
              <span className="text-foreground">{course.duration_hours || 10} Hours</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Language</span>
              <span className="text-foreground">{course.language || "English"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Status</span>
              <span className="text-emerald-600 font-bold">
                {course.is_published ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          {/* Syllabus Chapters */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              Course Syllabus ({chapters.length} Chapters)
            </h3>

            {chapters.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No chapters published yet.
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chap, idx) => (
                  <div key={chap.id} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        Chapter {idx + 1}: {chap.title}
                      </span>
                    </div>
                    {chap.description && (
                      <p className="text-xs text-muted-foreground">{chap.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow-md"
          >
            Exit Student Preview
          </button>
        </div>
      </div>
    </div>
  );
}
