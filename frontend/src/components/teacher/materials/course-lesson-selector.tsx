"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Layers, FileText } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useChapters } from "@/hooks/useChapters";
import { useLessons } from "@/hooks/useLessons";

interface CourseLessonSelectorProps {
  onLessonChange: (lessonId: number | null, details?: { courseTitle: string; chapterTitle: string; lessonTitle: string }) => void;
}

export function CourseLessonSelector({ onLessonChange }: CourseLessonSelectorProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // Fetch Courses
  const { data: coursesData, isLoading: isCoursesLoading } = useCourses({ page: 1, page_size: 50 });
  const courses = coursesData?.items || [];

  // Fetch Chapters for selected course
  const { data: chaptersData, isLoading: isChaptersLoading } = useChapters(selectedCourseId || undefined);
  const chapters = chaptersData || [];

  // Fetch Lessons for selected chapter
  const { data: lessonsResponse, isLoading: isLessonsLoading } = useLessons(selectedChapterId || undefined);
  const lessons = lessonsResponse?.items || [];

  // Auto select first course
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Auto select first chapter when chapters change
  useEffect(() => {
    if (chapters.length > 0) {
      setSelectedChapterId(chapters[0].id);
    } else {
      setSelectedChapterId(null);
      setSelectedLessonId(null);
      onLessonChange(null);
    }
  }, [chapters]);

  // Auto select first lesson when lessons change
  useEffect(() => {
    if (lessons.length > 0) {
      const firstLes = lessons[0];
      setSelectedLessonId(firstLes.id);
      const courseObj = courses.find((c: any) => c.id === selectedCourseId);
      const chapObj = chapters.find((ch) => ch.id === selectedChapterId);
      onLessonChange(firstLes.id, {
        courseTitle: courseObj?.title || "Course",
        chapterTitle: chapObj?.title || "Chapter",
        lessonTitle: firstLes.title,
      });
    } else {
      setSelectedLessonId(null);
      onLessonChange(null);
    }
  }, [lessons]);

  const handleCourseSelect = (id: number) => {
    setSelectedCourseId(id);
    setSelectedChapterId(null);
    setSelectedLessonId(null);
  };

  const handleChapterSelect = (id: number) => {
    setSelectedChapterId(id);
    setSelectedLessonId(null);
  };

  const handleLessonSelect = (id: number) => {
    setSelectedLessonId(id);
    const courseObj = courses.find((c: any) => c.id === selectedCourseId);
    const chapObj = chapters.find((ch) => ch.id === selectedChapterId);
    const lesObj = lessons.find((l) => l.id === id);
    onLessonChange(id, {
      courseTitle: courseObj?.title || "Course",
      chapterTitle: chapObj?.title || "Chapter",
      lessonTitle: lesObj?.title || "Lesson",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-border/50 pb-3">
        <Layers className="size-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Academic Hierarchy Selector
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Course Selector */}
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <BookOpen className="size-3 text-primary" />
            1. Select Course
          </label>
          <select
            value={selectedCourseId || ""}
            onChange={(e) => handleCourseSelect(Number(e.target.value))}
            disabled={isCoursesLoading}
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate"
          >
            {courses.length === 0 ? (
              <option value="">No courses available</option>
            ) : (
              courses.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Step 2: Chapter Selector */}
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Layers className="size-3 text-indigo-500" />
            2. Select Chapter
          </label>
          <select
            value={selectedChapterId || ""}
            onChange={(e) => handleChapterSelect(Number(e.target.value))}
            disabled={isChaptersLoading || !selectedCourseId}
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate"
          >
            {!selectedCourseId ? (
              <option value="">Select a course first</option>
            ) : chapters.length === 0 ? (
              <option value="">No chapters in this course</option>
            ) : (
              chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Step 3: Lesson Selector */}
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FileText className="size-3 text-emerald-500" />
            3. Select Lesson
          </label>
          <select
            value={selectedLessonId || ""}
            onChange={(e) => handleLessonSelect(Number(e.target.value))}
            disabled={isLessonsLoading || !selectedChapterId}
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 truncate"
          >
            {!selectedChapterId ? (
              <option value="">Select a chapter first</option>
            ) : lessons.length === 0 ? (
              <option value="">No lessons in this chapter</option>
            ) : (
              lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.type || "Theory"})
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
