import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse, getCourseById } from "@/lib/services/course.service";
import { createChapter, getChaptersByCourse } from "@/lib/services/chapter.service";
import { createLesson, getLessonsByChapter } from "@/lib/services/lesson.service";

export function useDuplicateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, newTitle }: { courseId: number; newTitle: string }) => {
      // 1. Fetch original course
      const originalCourse = await getCourseById(courseId);

      const targetTitle: string = newTitle || originalCourse?.title || "Duplicated Course";
      const targetDescription: string = originalCourse?.description || "Course description";

      // 2. Create new course
      const newCourse = await createCourse({
        title: targetTitle,
        description: targetDescription,
        level: originalCourse?.level || "Beginner",
        language: originalCourse?.language || "English",
        duration_hours: originalCourse?.duration_hours || 10,
      });

      // 3. Fetch original chapters
      try {
        const chapters = await getChaptersByCourse(courseId);
        for (const chap of chapters) {
          const newChap = await createChapter({
            course_id: newCourse.id,
            title: chap.title,
            description: chap.description || undefined,
            order_number: chap.order_number,
          });

          // 4. Fetch lessons & duplicate
          try {
            const lessonsResp = await getLessonsByChapter(chap.id);
            for (const les of lessonsResp.items) {
              await createLesson({
                chapter_id: newChap.id,
                title: les.title,
                description: les.description || undefined,
                order_number: les.order_number,
              });
            }
          } catch (e) {
            // silent fallback
          }
        }
      } catch (e) {
        // silent fallback
      }

      return newCourse;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
