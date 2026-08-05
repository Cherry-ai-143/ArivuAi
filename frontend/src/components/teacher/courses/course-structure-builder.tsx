"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
} from "lucide-react";

import { useChapters, useCreateChapter, useUpdateChapter, useDeleteChapter } from "@/hooks/useChapters";
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from "@/hooks/useLessons";
import { ChapterModal } from "./chapter-modal";
import { LessonModal } from "./lesson-modal";
import { LessonPreviewModal } from "./lesson-preview-modal";
import type { Chapter } from "@/types/chapter";
import type { Lesson, LessonType } from "@/types/lesson";

interface CourseStructureBuilderProps {
  courseId: number;
}

export function CourseStructureBuilder({ courseId }: CourseStructureBuilderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlChapterId = searchParams.get("chapter") ? Number(searchParams.get("chapter")) : null;
  const urlLessonId = searchParams.get("lesson") ? Number(searchParams.get("lesson")) : null;

  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(urlChapterId);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(urlLessonId);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals state
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

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync URL search params
  const updateUrlState = useCallback(
    (chapId: number | null, lesId: number | null) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (chapId) current.set("chapter", String(chapId));
      else current.delete("chapter");

      if (lesId) current.set("lesson", String(lesId));
      else current.delete("lesson");

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Queries & Mutations
  const { data: chaptersData, isLoading: isChaptersLoading } = useChapters(courseId);
  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();
  const deleteChapterMutation = useDeleteChapter();

  const { data: lessonsResponse, isLoading: isLessonsLoading } = useLessons(
    expandedChapterId || undefined,
    debouncedSearch ? { search: debouncedSearch } : undefined
  );
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const chapters = useMemo(() => chaptersData || [], [chaptersData]);
  const lessons = useMemo(() => lessonsResponse?.items || [], [lessonsResponse]);

  // Auto-expand first chapter if none expanded
  useEffect(() => {
    if (chapters.length > 0 && !expandedChapterId) {
      setExpandedChapterId(chapters[0].id);
      updateUrlState(chapters[0].id, selectedLessonId);
    }
  }, [chapters, expandedChapterId, selectedLessonId, updateUrlState]);

  const toggleChapterExpand = (chapId: number) => {
    const nextId = expandedChapterId === chapId ? null : chapId;
    setExpandedChapterId(nextId);
    updateUrlState(nextId, selectedLessonId);
  };

  // Reorder Chapters
  const handleMoveChapter = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const c1 = chapters[index];
    const c2 = chapters[targetIndex];

    try {
      await updateChapterMutation.mutateAsync({
        id: c1.id,
        courseId,
        data: { order_number: c2.order_number },
      });
      await updateChapterMutation.mutateAsync({
        id: c2.id,
        courseId,
        data: { order_number: c1.order_number },
      });
      showToast("success", "Chapter order updated");
    } catch (err: any) {
      showToast("error", "Failed to reorder chapters");
    }
  };

  // Reorder Lessons
  const handleMoveLesson = async (index: number, direction: "up" | "down") => {
    if (!expandedChapterId) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const l1 = lessons[index];
    const l2 = lessons[targetIndex];

    try {
      await updateLessonMutation.mutateAsync({
        id: l1.id,
        chapterId: expandedChapterId,
        data: { order_number: l2.order_number },
      });
      await updateLessonMutation.mutateAsync({
        id: l2.id,
        chapterId: expandedChapterId,
        data: { order_number: l1.order_number },
      });
      showToast("success", "Lesson order updated");
    } catch (err: any) {
      showToast("error", "Failed to reorder lessons");
    }
  };

  // Chapter CRUD
  const handleSaveChapter = async (data: { title: string; description?: string; order_number: number }) => {
    try {
      if (activeChapterModal.chapter) {
        await updateChapterMutation.mutateAsync({
          id: activeChapterModal.chapter.id,
          courseId,
          data,
        });
        showToast("success", "Chapter updated");
      } else {
        await createChapterMutation.mutateAsync({
          course_id: courseId,
          ...data,
        });
        showToast("success", "New Chapter created");
      }
      setActiveChapterModal({ isOpen: false, chapter: null });
    } catch (err: any) {
      showToast("error", err.response?.data?.detail || "Failed to save chapter");
    }
  };

  const handleConfirmDeleteChapter = async () => {
    if (!deletingChapter) return;
    try {
      await deleteChapterMutation.mutateAsync({ id: deletingChapter.id, courseId });
      showToast("success", "Chapter deleted");
      if (expandedChapterId === deletingChapter.id) {
        setExpandedChapterId(null);
      }
      setDeletingChapter(null);
    } catch (err: any) {
      showToast("error", "Failed to delete chapter");
    }
  };

  // Lesson CRUD
  const handleSaveLesson = async (data: {
    title: string;
    description?: string;
    order_number: number;
    duration_minutes?: number;
    type?: LessonType;
    is_published?: boolean;
  }) => {
    const chapterId = activeLessonModal.chapterId || expandedChapterId;
    if (!chapterId) return;

    try {
      if (activeLessonModal.lesson) {
        await updateLessonMutation.mutateAsync({
          id: activeLessonModal.lesson.id,
          chapterId,
          data,
        });
        showToast("success", "Lesson updated");
      } else {
        await createLessonMutation.mutateAsync({
          chapter_id: chapterId,
          ...data,
        });
        showToast("success", "New Lesson created");
      }
      setActiveLessonModal({ isOpen: false, lesson: null, chapterId: 0 });
    } catch (err: any) {
      showToast("error", err.response?.data?.detail || "Failed to save lesson");
    }
  };

  const handleConfirmDeleteLesson = async () => {
    if (!deletingLesson) return;
    try {
      await deleteLessonMutation.mutateAsync({
        id: deletingLesson.lesson.id,
        chapterId: deletingLesson.chapterId,
      });
      showToast("success", "Lesson deleted");
      setDeletingLesson(null);
    } catch (err: any) {
      showToast("error", "Failed to delete lesson");
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

      {/* Control Bar: Search & Add Chapter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters & lessons..."
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <button
          type="button"
          onClick={() => setActiveChapterModal({ isOpen: true, chapter: null })}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          Add Chapter
        </button>
      </div>

      {/* Loading Chapters Skeleton */}
      {isChaptersLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-border bg-card p-4 animate-pulse" />
          ))}
        </div>
      ) : chapters.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <BookOpen className="mx-auto size-10 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">No Chapters Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Start structuring your course by adding your first curriculum chapter.
          </p>
          <button
            type="button"
            onClick={() => setActiveChapterModal({ isOpen: true, chapter: null })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 transition-all"
          >
            <Plus className="size-4" />
            Create First Chapter
          </button>
        </div>
      ) : (
        /* Accordion Chapter List */
        <div className="space-y-4">
          {chapters.map((chap, idx) => {
            const isExpanded = expandedChapterId === chap.id;

            return (
              <div
                key={chap.id}
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all"
              >
                {/* Chapter Header */}
                <div
                  onClick={() => toggleChapterExpand(chap.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChapter(idx, "up");
                        }}
                        disabled={idx === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChapter(idx, "down");
                        }}
                        disabled={idx === chapters.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="size-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground flex-shrink-0" />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary uppercase">
                          Chapter {chap.order_number || idx + 1}
                        </span>
                        <h4 className="font-bold text-foreground text-sm truncate">{chap.title}</h4>
                      </div>
                      {chap.description && (
                        <p className="text-xs text-muted-foreground truncate">{chap.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveLessonModal({ isOpen: true, lesson: null, chapterId: chap.id })
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                      <Plus className="size-3.5" />
                      Add Lesson
                    </button>
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

                {/* Expanded Lessons Drawer */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-4 space-y-3">
                    {isLessonsLoading ? (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
                        ))}
                      </div>
                    ) : lessons.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2">
                        <p className="text-xs font-semibold text-foreground">No Lessons in this Chapter</p>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveLessonModal({ isOpen: true, lesson: null, chapterId: chap.id })
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                        >
                          <Plus className="size-3.5" />
                          Add First Lesson
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lessons.map((les, lIdx) => (
                          <div
                            key={les.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveLesson(lIdx, "up")}
                                  disabled={lIdx === 0}
                                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                >
                                  <ArrowUp className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveLesson(lIdx, "down")}
                                  disabled={lIdx === lessons.length - 1}
                                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                >
                                  <ArrowDown className="size-3" />
                                </button>
                              </div>

                              <CheckCircle className="size-4 text-emerald-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground truncate">
                                    {les.title}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                    {les.type || "Theory"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {les.duration_minutes || 45}m
                                  </span>
                                  <span>Order #{les.order_number || lIdx + 1}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewLesson(les)}
                                className="p-1.5 text-accent hover:bg-accent/10 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <Eye className="size-3.5" />
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveLessonModal({
                                    isOpen: true,
                                    lesson: les,
                                    chapterId: chap.id,
                                  })
                                }
                                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                              >
                                <Edit2 className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeletingLesson({ lesson: les, chapterId: chap.id })
                                }
                                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Chapter Modal */}
      <ChapterModal
        isOpen={activeChapterModal.isOpen}
        chapter={activeChapterModal.chapter}
        courseId={courseId}
        onClose={() => setActiveChapterModal({ isOpen: false, chapter: null })}
        onSave={handleSaveChapter}
        isSaving={createChapterMutation.isPending || updateChapterMutation.isPending}
      />

      {/* Delete Chapter Prompt Modal */}
      {deletingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Delete Chapter &quot;{deletingChapter.title}&quot;?
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deleting this chapter will also remove all lessons inside it. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingChapter(null)}
                disabled={deleteChapterMutation.isPending}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteChapter}
                disabled={deleteChapterMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow-md"
              >
                {deleteChapterMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      <LessonModal
        isOpen={activeLessonModal.isOpen}
        lesson={activeLessonModal.lesson}
        chapterId={activeLessonModal.chapterId}
        onClose={() => setActiveLessonModal({ isOpen: false, lesson: null, chapterId: 0 })}
        onSave={handleSaveLesson}
        isSaving={createLessonMutation.isPending || updateLessonMutation.isPending}
      />

      {/* Delete Lesson Prompt Modal */}
      {deletingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Delete Lesson &quot;{deletingLesson.lesson.title}&quot;?
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLesson(null)}
                disabled={deleteLessonMutation.isPending}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLesson}
                disabled={deleteLessonMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow-md"
              >
                {deleteLessonMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Delete Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Preview Modal */}
      <LessonPreviewModal
        isOpen={Boolean(previewLesson)}
        lesson={previewLesson}
        onClose={() => setPreviewLesson(null)}
      />
    </div>
  );
}
