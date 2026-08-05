import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  deleteLessonResource,
  getLessonResources,
  updateLessonResource,
  uploadLessonResource,
} from "@/lib/services/lesson-resource.service";
import type {
  LessonResourceCreateRequest,
  LessonResourceGroupedResponse,
  LessonResourceUpdateRequest,
} from "@/types/lesson-resource";
import { getStoredToken } from "@/lib/api/axios";

export function useLessonResources(lessonId?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: queryKeys.lessons.resources(lessonId!),
    queryFn: () => getLessonResources(lessonId!),
    enabled: Boolean(token && lessonId && lessonId > 0),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUploadLessonResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      data,
      onProgress,
    }: {
      lessonId: number;
      data: LessonResourceCreateRequest;
      onProgress?: (progressEvent: { loaded: number; total?: number }) => void;
    }) => uploadLessonResource(lessonId, data, onProgress),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lessons.resources(variables.lessonId),
      });
    },
  });
}

export function useUpdateLessonResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      resourceId,
      data,
    }: {
      lessonId: number;
      resourceId: number;
      data: LessonResourceUpdateRequest;
    }) => updateLessonResource(lessonId, resourceId, data),
    onMutate: async ({ lessonId, resourceId, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.lessons.resources(lessonId),
      });

      const previous = queryClient.getQueryData<LessonResourceGroupedResponse>(
        queryKeys.lessons.resources(lessonId)
      );

      if (previous) {
        const updatedAll = previous.all_resources.map((r) =>
          r.id === resourceId ? { ...r, ...data } : r
        );
        queryClient.setQueryData<LessonResourceGroupedResponse>(
          queryKeys.lessons.resources(lessonId),
          {
            ...previous,
            all_resources: updatedAll,
          }
        );
      }

      return { previous };
    },
    onError: (_err, { lessonId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.lessons.resources(lessonId),
          context.previous
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lessons.resources(variables.lessonId),
      });
    },
  });
}

export function useDeleteLessonResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      resourceId,
    }: {
      lessonId: number;
      resourceId: number;
    }) => deleteLessonResource(lessonId, resourceId),
    onMutate: async ({ lessonId, resourceId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.lessons.resources(lessonId),
      });

      const previous = queryClient.getQueryData<LessonResourceGroupedResponse>(
        queryKeys.lessons.resources(lessonId)
      );

      if (previous) {
        const filteredAll = previous.all_resources.filter((r) => r.id !== resourceId);
        queryClient.setQueryData<LessonResourceGroupedResponse>(
          queryKeys.lessons.resources(lessonId),
          {
            ...previous,
            all_resources: filteredAll,
          }
        );
      }

      return { previous };
    },
    onError: (_err, { lessonId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.lessons.resources(lessonId),
          context.previous
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lessons.resources(variables.lessonId),
      });
    },
  });
}
