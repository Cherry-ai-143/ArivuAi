// purpose : Provide course queries and mutations while keeping course cache
// isolated per authenticated user.

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
import { useAuth } from "@/hooks/useAuth";


export function useCourses(params?: CourseQueryParams) {
  const token =
    typeof window !== "undefined"
      ? getStoredToken()
      : null;

  const { currentUser, isLoading: isAuthLoading } = useAuth();

  const userId = currentUser?.id ?? null;

  return useQuery({
    // purpose : Make the authenticated user part of the cache identity.
    // Teacher A and Teacher B therefore receive completely separate caches.
    queryKey: queryKeys.courses.list(
      params as Record<string, unknown>,
      userId
    ),

    queryFn: () => getCourses(params),

    // purpose : Do not request courses until authentication has finished
    // and a valid user/token is available.
    enabled:
      Boolean(token) &&
      Boolean(userId) &&
      !isAuthLoading,

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 5,

    // purpose : Never display the previous authenticated user's courses
    // while the new user's courses are being fetched.
    placeholderData: undefined,
  });
}


export function useCourse(courseId?: number) {
  const token =
    typeof window !== "undefined"
      ? getStoredToken()
      : null;

  return useQuery({
    queryKey: queryKeys.courses.detail(courseId!),

    queryFn: () => getCourseById(courseId!),

    enabled: Boolean(
      token &&
      courseId &&
      courseId > 0
    ),

    staleTime: 1000 * 60 * 2,
  });
}


export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseRequest) =>
      createCourse(data),

    onSuccess: () => {
      // purpose : Refresh all course lists after creating a course.
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.teacher,
      });
    },
  });
}


export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCourseRequest;
    }) =>
      updateCourse(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.courses.all,
      });

      const previousCourse =
        queryClient.getQueryData<Course>(
          queryKeys.courses.detail(id)
        );

      if (previousCourse) {
        queryClient.setQueryData<Course>(
          queryKeys.courses.detail(id),
          {
            ...previousCourse,
            ...data,
            updated_at: new Date().toISOString(),
          }
        );
      }

      return {
        previousCourse,
      };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData(
          queryKeys.courses.detail(id),
          context.previousCourse
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.teacher,
      });
    },
  });
}


export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      deleteCourse(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.courses.all,
      });

      queryClient.setQueriesData<PaginatedCourseResponse>(
        {
          queryKey: queryKeys.courses.all,
        },
        (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,

            items: old.items.filter(
              (item) => item.id !== id
            ),

            total: Math.max(
              0,
              old.total - 1
            ),
          };
        }
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.teacher,
      });
    },
  });
}