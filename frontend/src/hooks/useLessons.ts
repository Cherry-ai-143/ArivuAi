import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  createLesson,
  deleteLesson,
  getLessonsByChapter,
  updateLesson,
  type PaginatedLessonResponse,
} from "@/lib/services/lesson.service";
import type {
  CreateLessonRequest,
  Lesson,
  LessonQueryParams,
  UpdateLessonRequest,
} from "@/types/lesson";
import { getStoredToken } from "@/lib/api/axios";

export function useLessons(chapterId?: number, params?: LessonQueryParams) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: [...queryKeys.lessons.byChapter(chapterId!), params],
    queryFn: () => getLessonsByChapter(chapterId!, params),
    enabled: Boolean(token && chapterId && chapterId > 0),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLessonRequest) => createLesson(data),
    onMutate: async (newLesson) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.lessons.byChapter(newLesson.chapter_id) });

      const queryKeyPattern = queryKeys.lessons.byChapter(newLesson.chapter_id);
      queryClient.setQueriesData<PaginatedLessonResponse>(
        { queryKey: queryKeyPattern },
        (old) => {
          if (!old) return old;
          const optimistic: Lesson = {
            id: Date.now(),
            chapter_id: newLesson.chapter_id,
            title: newLesson.title,
            description: newLesson.description,
            order_number: newLesson.order_number,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return {
            ...old,
            items: [...old.items, optimistic],
            total: old.total + 1,
          };
        }
      );
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.byChapter(variables.chapter_id) });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; chapterId: number; data: UpdateLessonRequest }) =>
      updateLesson(id, data),
    onMutate: async ({ id, chapterId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.lessons.byChapter(chapterId) });

      queryClient.setQueriesData<PaginatedLessonResponse>(
        { queryKey: queryKeys.lessons.byChapter(chapterId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((les) => (les.id === id ? { ...les, ...data } : les)),
          };
        }
      );
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.byChapter(variables.chapterId) });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; chapterId: number }) => deleteLesson(id),
    onMutate: async ({ id, chapterId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.lessons.byChapter(chapterId) });

      queryClient.setQueriesData<PaginatedLessonResponse>(
        { queryKey: queryKeys.lessons.byChapter(chapterId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((les) => les.id !== id),
            total: Math.max(0, old.total - 1),
          };
        }
      );
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.byChapter(variables.chapterId) });
    },
  });
}
