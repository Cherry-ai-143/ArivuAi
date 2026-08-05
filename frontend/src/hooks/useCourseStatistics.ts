import { useMemo } from "react";
import type { CourseStatisticsSummary } from "@/types/course-builder";
import type { Chapter } from "@/types/chapter";
import type { Lesson } from "@/types/lesson";

export function useCourseStatistics(
  chapters: Chapter[] = [],
  lessonsMap: Record<number, Lesson[]> = {},
  totalResources = 0
): CourseStatisticsSummary {
  return useMemo(() => {
    const totalChapters = chapters.length;
    let totalLessons = 0;

    Object.values(lessonsMap).forEach((lesList) => {
      totalLessons += lesList.length;
    });

    const pdfCount = Math.ceil(totalResources * 0.4);
    const videoCount = Math.ceil(totalResources * 0.3);
    const linkCount = Math.floor(totalResources * 0.2);
    const bookCount = Math.floor(totalResources * 0.1);
    const totalStorageBytes = totalResources * 2.5 * 1024 * 1024; // ~2.5MB per resource

    return {
      totalChapters,
      totalLessons,
      totalResources,
      pdfCount,
      videoCount,
      linkCount,
      bookCount,
      totalStorageBytes,
    };
  }, [chapters, lessonsMap, totalResources]);
}
