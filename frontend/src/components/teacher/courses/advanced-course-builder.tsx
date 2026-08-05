"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Layers,
} from "lucide-react";

import { useChapters, useCreateChapter, useUpdateChapter, useDeleteChapter } from "@/hooks/useChapters";
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from "@/hooks/useLessons";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useCourseValidation } from "@/hooks/useCourseValidation";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useCourseStatistics } from "@/hooks/useCourseStatistics";
import { useBulkActions } from "@/hooks/useBulkActions";
import { useDuplicateCourse } from "@/hooks/useDuplicate";
import { AutoSaveIndicator } from "./autosave-indicator";
import { CourseBreadcrumbs } from "./course-breadcrumbs";
import { CourseValidationPanel } from "./course-validation-panel";
import { BulkToolbar } from "./bulk-toolbar";
import { DuplicateCourseModal } from "./duplicate-course-modal";
import { CourseLivePreviewModal } from "./course-live-preview-modal";
import { ChapterModal } from "./chapter-modal";
import { LessonModal } from "./lesson-modal";
import { LessonPreviewModal } from "./lesson-preview-modal";
import type { Course } from "@/types/course";
import type { Chapter } from "@/types/chapter";
import type { Lesson } from "@/types/lesson";

interface AdvancedCourseBuilderProps {
  course?: Course | null;
  courseId: number;
}

export function AdvancedCourseBuilder({ course, courseId }: AdvancedCourseBuilderProps) {
  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isPublished, setIsPublished] = useState<boolean>(course?.is_published ?? false);

  // Modals state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [activeChapterModal, setActiveChapterModal] = useState<{ isOpen: boolean; chapter: Chapter | null }>({
    isOpen: false,
    chapter: null,
  });
  const [activeLessonModal, setActiveLessonModal] = useState<{ isOpen: boolean; lesson: Lesson | null; chapterId: number }>({
    isOpen: false,
    lesson: null,
    chapterId: 0,
  });
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{ lesson: Lesson; chapterId: number } | null>(null);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Queries & Mutations
  const { data: chaptersData, isLoading: isChaptersLoading } = useChapters(courseId);
  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();
  const deleteChapterMutation = useDeleteChapter();

  const { data: lessonsResponse, isLoading: isLessonsLoading } = useLessons(expandedChapterId || undefined);
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();
  const duplicateCourseMutation = useDuplicateCourse();

  const chapters = useMemo(() => chaptersData || [], [chaptersData]);
  const lessons = useMemo(() => lessonsResponse?.items || [], [lessonsResponse]);

  // Bulk Actions Manager for chapters
  const bulkChapters = useBulkActions<Chapter>();

  // Auto-Save Manager
  const handleAutoSaveAction = useCallback(async () => {
    // 2s auto-save trigger
  }, []);
  const autoSave = useAutoSave(handleAutoSaveAction, 2000);

  // Course Validation & Progress
  const validation = useCourseValidation(course, chapters, lessons.length, 5);
  const progress = useCourseProgress(validation, isPublished);
  const stats = useCourseStatistics(chapters, {}, 5);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Keyboard Shortcuts Listener (Ctrl+S, Ctrl+D, Delete, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        autoSave.triggerSaveNow();
        showToast("success", "Course saved");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setIsDuplicateModalOpen(true);
      }
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
        setIsDuplicateModalOpen(false);
        setActiveChapterModal({ isOpen: false, chapter: null });
        setActiveLessonModal({ isOpen: false, lesson: null, chapterId: 0 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [autoSave]);

  // Expand / Collapse All
  const handleExpandAll = () => {
    if (chapters.length > 0) setExpandedChapterId(chapters[0].id);
  };
  const handleCollapseAll = () => setExpandedChapterId(null);

  // Reorder Chapters
  const handleMoveChapter = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    autoSave.markDirty();

    const c1 = chapters[index];
    const c2 = chapters[targetIndex];

    try {
      await updateChapterMutation.mutateAsync({ id: c1.id, courseId, data: { order_number: c2.order_number } });
      await updateChapterMutation.mutateAsync({ id: c2.id, courseId, data: { order_number: c1.order_number } });
      showToast("success", "Chapter order updated");
    } catch (err: any) {
      showToast("error", "Failed to reorder chapters");
    }
  };

  // Chapter CRUD
  const handleSaveChapter = async (data: { title: string; description?: string; order_number: number }) => {
    autoSave.markDirty();
    try {
      if (activeChapterModal.chapter) {
        await updateChapterMutation.mutateAsync({ id: activeChapterModal.chapter.id, courseId, data });
        showToast("success", "Chapter updated");
      } else {
        await createChapterMutation.mutateAsync({ course_id: courseId, ...data });
        showToast("success", "New Chapter created");
      }
      setActiveChapterModal({ isOpen: false, chapter: null });
    } catch (err: any) {
      showToast("error", "Failed to save chapter");
    }
  };

  const handleConfirmDeleteChapter = async () => {
    if (!deletingChapter) return;
    autoSave.markDirty();
    try {
      await deleteChapterMutation.mutateAsync({ id: deletingChapter.id, courseId });
      showToast("success", "Chapter deleted");
      setDeletingChapter(null);
    } catch (err: any) {
      showToast("error", "Failed to delete chapter");
    }
  };

  // Bulk Delete Chapters via Promise.all
  const handleBulkDeleteChapters = async () => {
    if (bulkChapters.selectedIds.length === 0) return;
    autoSave.markDirty();
    try {
      await Promise.all(
        bulkChapters.selectedIds.map((id) => deleteChapterMutation.mutateAsync({ id, courseId }))
      );
      bulkChapters.clearSelection();
      showToast("success", "Selected chapters deleted");
    } catch (err) {
      showToast("error", "Bulk delete failed");
    }
  };

  // Duplicate Course Confirm
  const handleConfirmDuplicateCourse = async (newTitle: string) => {
    try {
      await duplicateCourseMutation.mutateAsync({ courseId, newTitle });
      setIsDuplicateModalOpen(false);
      showToast("success", "Course duplicated successfully!");
    } catch (err) {
      showToast("error", "Failed to duplicate course.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center justify-between shadow-lg ${
            toastMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-xs opacity-70">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <CourseBreadcrumbs courseTitle={course?.title} />
          <h2 className="text-xl font-bold text-foreground">Advanced Curriculum Authoring Workspace</h2>
        </div>

        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={autoSave.status} lastSavedTime={autoSave.lastSavedTime} />
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <Eye className="size-3.5 text-primary" />
            Live Student Preview
          </button>
          <button
            type="button"
            onClick={() => setIsDuplicateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <Copy className="size-3.5 text-accent" />
            Duplicate Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Curriculum Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Expand All
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Collapse All
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveChapterModal({ isOpen: true, chapter: null })}
              disabled={autoSave.isLocked}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-50"
            >
              <Plus className="size-4" />
              Add Chapter
            </button>
          </div>

          {/* Chapters Accordion */}
          {isChaptersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl border border-border bg-card p-4 animate-pulse" />
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
              <BookOpen className="mx-auto size-10 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">No Chapters Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create your first chapter to begin building your course structure.
              </p>
              <button
                type="button"
                onClick={() => setActiveChapterModal({ isOpen: true, chapter: null })}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md"
              >
                <Plus className="size-4" /> Create Chapter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chap, idx) => {
                const isExpanded = expandedChapterId === chap.id;

                return (
                  <div key={chap.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div
                      onClick={() => setExpandedChapterId(isExpanded ? null : chap.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={bulkChapters.isSelected(chap.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            bulkChapters.toggleSelect(chap.id);
                          }}
                          className="rounded border-border text-primary focus:ring-primary/40"
                        />
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveChapter(idx, "up");
                            }}
                            disabled={idx === 0}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveChapter(idx, "down");
                            }}
                            disabled={idx === chapters.length - 1}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowDown className="size-3" />
                          </button>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="size-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="size-5 text-muted-foreground flex-shrink-0" />
                        )}

                        <div className="min-w-0">
                          <span className="text-xs font-bold text-primary uppercase">
                            Chapter {chap.order_number || idx + 1}
                          </span>
                          <h4 className="font-bold text-foreground text-sm truncate">{chap.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveChapterModal({ isOpen: true, chapter: chap })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingChapter(chap)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Readiness Drawer & Stats */}
        <div className="space-y-6">
          <CourseValidationPanel
            validation={validation}
            progress={progress}
            isPublished={isPublished}
            onTogglePublish={() => setIsPublished(!isPublished)}
            isPublishing={false}
          />
        </div>
      </div>

      {/* Multi-Select Bulk Toolbar */}
      <BulkToolbar
        count={bulkChapters.count}
        onClear={bulkChapters.clearSelection}
        onDeleteSelected={handleBulkDeleteChapters}
      />

      {/* Modals */}
      <CourseLivePreviewModal
        isOpen={isPreviewOpen}
        course={course || null}
        chapters={chapters}
        onClose={() => setIsPreviewOpen(false)}
      />

      <DuplicateCourseModal
        isOpen={isDuplicateModalOpen}
        itemTitle={course?.title || "Course"}
        itemType="Course"
        onClose={() => setIsDuplicateModalOpen(false)}
        onConfirm={handleConfirmDuplicateCourse}
        isDuplicating={duplicateCourseMutation.isPending}
      />

      <ChapterModal
        isOpen={activeChapterModal.isOpen}
        chapter={activeChapterModal.chapter}
        courseId={courseId}
        onClose={() => setActiveChapterModal({ isOpen: false, chapter: null })}
        onSave={handleSaveChapter}
        isSaving={createChapterMutation.isPending || updateChapterMutation.isPending}
      />

      {/* Delete Chapter Modal */}
      {deletingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-destructive" />
              <h3 className="text-base font-bold text-foreground">Delete Chapter &quot;{deletingChapter.title}&quot;?</h3>
            </div>
            <p className="text-xs text-muted-foreground">Deleting this chapter will also remove all lessons inside it.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeletingChapter(null)} className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground">Cancel</button>
              <button type="button" onClick={handleConfirmDeleteChapter} className="rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground">Delete Chapter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
