import { apiClient } from "@/lib/api/axios";
import { COURSES } from "@/lib/api/endpoints";
import type {
  Course,
  CourseQueryParams,
  CreateCourseRequest,
  PaginatedCourseResponse,
  UpdateCourseRequest,
} from "@/types/course";

export type {
  Course,
  CourseQueryParams,
  CreateCourseRequest,
  PaginatedCourseResponse,
  UpdateCourseRequest,
};

export async function getCourses(params?: CourseQueryParams): Promise<PaginatedCourseResponse> {
  const queryParams: Record<string, unknown> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search || params?.q) queryParams.q = params.search || params.q;
  if (params?.level && params.level !== 'All') queryParams.level = params.level;

  if (params?.status === 'published') {
    queryParams.is_published = true;
  } else if (params?.status === 'draft') {
    queryParams.is_published = false;
  } else if (typeof params?.is_published === 'boolean') {
    queryParams.is_published = params.is_published;
  }

  if (params?.sort) queryParams.sort = params.sort;
  if (params?.order) queryParams.order = params.order;
  if (params?.my_courses) queryParams.my_courses = params.my_courses;

  // Use search endpoint if pagination or search params are set
  try {
    const url = `${COURSES}/search`;
    console.log("COURSES REQUEST:", url, queryParams);
    const response = await apiClient.get<PaginatedCourseResponse>(url, {
      params: queryParams,
    });
    console.log("COURSES API RESPONSE:", response.data);
    return response.data;
  } catch (error) {
    // Fallback to /api/v1/courses/ if search endpoint fails
    const url = `${COURSES}/`;
    console.log("COURSES FALLBACK REQUEST:", url, queryParams);
    const response = await apiClient.get<Course[]>(url, {
      params: queryParams,
    });
    const items = Array.isArray(response.data) ? response.data : [];
    console.log("COURSES FALLBACK API RESPONSE:", response.data);
    return {
      items,
      total: items.length,
      page: params?.page || 1,
      page_size: params?.page_size || 9,
      pages: 1,
    };
  }
}

export async function getCourseById(courseId: number): Promise<Course> {
  const response = await apiClient.get<Course>(`${COURSES}/${courseId}`);
  return response.data;
}

export async function createCourse(data: CreateCourseRequest): Promise<Course> {
  const response = await apiClient.post<Course>(`${COURSES}/`, data);
  return response.data;
}

export async function updateCourse(courseId: number, data: UpdateCourseRequest): Promise<Course> {
  const response = await apiClient.put<Course>(`${COURSES}/${courseId}`, data);
  return response.data;
}

export async function deleteCourse(courseId: number): Promise<void> {
  await apiClient.delete(`${COURSES}/${courseId}`);
}
