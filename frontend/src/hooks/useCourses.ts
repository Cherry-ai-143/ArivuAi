import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from "@/lib/services/course.service";
import type {
  Course,
  CourseQueryParams,
  CreateCourseRequest,
  PaginatedCourseResponse,
  UpdateCourseRequest,
} from "@/types/course";
import { getStoredToken } from "@/lib/api/axios";

export function useCourses(params?: CourseQueryParams) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: queryKeys.courses.list(params as Record<string, unknown>),
    queryFn: () => getCourses(params),
    enabled: Boolean(token),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

export function useCourse(courseId?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: queryKeys.courses.detail(courseId!),
    queryFn: () => getCourseById(courseId!),
    enabled: Boolean(token && courseId && courseId > 0),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseRequest) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacher });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) =>
      updateCourse(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.all });

      const previousCourse = queryClient.getQueryData<Course>(queryKeys.courses.detail(id));
      if (previousCourse) {
        queryClient.setQueryData<Course>(queryKeys.courses.detail(id), {
          ...previousCourse,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousCourse };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData(queryKeys.courses.detail(id), context.previousCourse);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacher });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCourse(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.all });

      // Optimistically filter out from active queries
      queryClient.setQueriesData<PaginatedCourseResponse>(
        { queryKey: queryKeys.courses.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
            total: Math.max(0, old.total - 1),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.teacher });
    },
  });
}
