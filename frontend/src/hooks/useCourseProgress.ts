import { useMemo } from "react";
import type { CourseCompletionProgress } from "@/types/course-builder";
import type { CourseValidationChecklist } from "@/types/course-builder";

export function useCourseProgress(
  validation: CourseValidationChecklist,
  isPublished = false
): CourseCompletionProgress {
  return useMemo(() => {
    let completedSteps = 0;
    const totalSteps = 6;

    if (validation.hasTitle) completedSteps++;
    if (validation.hasDescription) completedSteps++;
    if (validation.hasChapters) completedSteps++;
    if (validation.hasLessons) completedSteps++;
    if (validation.hasResources) completedSteps++;
    if (isPublished) completedSteps++;

    const percentage = Math.round((completedSteps / totalSteps) * 100);

    return {
      percentage,
      completedSteps,
      totalSteps,
    };
  }, [validation, isPublished]);
}
