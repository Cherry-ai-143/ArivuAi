import { useMemo } from "react";
import type { CourseValidationChecklist } from "@/types/course-builder";
import type { Course } from "@/types/course";
import type { Chapter } from "@/types/chapter";

export function useCourseValidation(
  course?: Course | null,
  chapters?: Chapter[],
  totalLessons = 0,
  totalResources = 0
): CourseValidationChecklist {
  return useMemo(() => {
    const hasTitle = Boolean(course?.title && course.title.trim().length >= 3);
    const hasDescription = Boolean(course?.description && course.description.trim().length >= 10);
    const hasThumbnail = true; // thumbnail fallback present
    const hasChapters = Boolean(chapters && chapters.length > 0);
    const hasLessons = totalLessons > 0;
    const hasResources = totalResources > 0;

    const missingItems: string[] = [];
    if (!hasTitle) missingItems.push("Course Title (at least 3 characters)");
    if (!hasDescription) missingItems.push("Course Description");
    if (!hasChapters) missingItems.push("At least one Chapter");
    if (!hasLessons) missingItems.push("At least one Lesson");
    if (!hasResources) missingItems.push("Lesson Study Resources");

    const isReadyToPublish = missingItems.length === 0;

    return {
      hasTitle,
      hasDescription,
      hasThumbnail,
      hasChapters,
      hasLessons,
      hasResources,
      isReadyToPublish,
      missingItems,
    };
  }, [course, chapters, totalLessons, totalResources]);
}
