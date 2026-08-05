import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  createChapter,
  deleteChapter,
  getChaptersByCourse,
  updateChapter,
} from "@/lib/services/chapter.service";
import type {
  Chapter,
  CreateChapterRequest,
  UpdateChapterRequest,
} from "@/types/chapter";
import { getStoredToken } from "@/lib/api/axios";

export function useChapters(courseId?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: queryKeys.chapters.byCourse(courseId!),
    queryFn: () => getChaptersByCourse(courseId!),
    enabled: Boolean(token && courseId && courseId > 0),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChapterRequest) => createChapter(data),
    onMutate: async (newChapter) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chapters.byCourse(newChapter.course_id) });

      const previous = queryClient.getQueryData<Chapter[]>(
        queryKeys.chapters.byCourse(newChapter.course_id)
      );

      if (previous) {
        const optimistic: Chapter = {
          id: Date.now(),
          course_id: newChapter.course_id,
          title: newChapter.title,
          description: newChapter.description,
          order_number: newChapter.order_number,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData(queryKeys.chapters.byCourse(newChapter.course_id), [
          ...previous,
          optimistic,
        ]);
      }

      return { previous };
    },
    onError: (_err, newChapter, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.chapters.byCourse(newChapter.course_id),
          context.previous
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters.byCourse(variables.course_id) });
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; courseId: number; data: UpdateChapterRequest }) =>
      updateChapter(id, data),
    onMutate: async ({ id, courseId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chapters.byCourse(courseId) });

      const previous = queryClient.getQueryData<Chapter[]>(queryKeys.chapters.byCourse(courseId));
      if (previous) {
        queryClient.setQueryData<Chapter[]>(
          queryKeys.chapters.byCourse(courseId),
          previous.map((c) => (c.id === id ? { ...c, ...data } : c))
        );
      }

      return { previous };
    },
    onError: (_err, { courseId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.chapters.byCourse(courseId), context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters.byCourse(variables.courseId) });
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; courseId: number }) => deleteChapter(id),
    onMutate: async ({ id, courseId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chapters.byCourse(courseId) });

      const previous = queryClient.getQueryData<Chapter[]>(queryKeys.chapters.byCourse(courseId));
      if (previous) {
        queryClient.setQueryData<Chapter[]>(
          queryKeys.chapters.byCourse(courseId),
          previous.filter((c) => c.id !== id)
        );
      }

      return { previous };
    },
    onError: (_err, { courseId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.chapters.byCourse(courseId), context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters.byCourse(variables.courseId) });
    },
  });
}
