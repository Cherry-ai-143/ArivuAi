import { apiClient } from "@/lib/api/axios";
import { CHAPTERS, LESSONS } from "@/lib/api/endpoints";
import type {
  CreateLessonRequest,
  Lesson,
  LessonQueryParams,
  UpdateLessonRequest,
} from "@/types/lesson";

export interface PaginatedLessonResponse {
  items: Lesson[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export async function getLessonsByChapter(
  chapterId: number,
  params?: LessonQueryParams
): Promise<PaginatedLessonResponse> {
  const queryParams: Record<string, unknown> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.page_size) queryParams.page_size = params.page_size;
  if (params?.search || params?.q) queryParams.search = params.search || params.q;
  if (params?.sort) queryParams.sort = params.sort;
  if (params?.order) queryParams.order = params.order;

  try {
    const response = await apiClient.get<PaginatedLessonResponse>(
      `${CHAPTERS}/${chapterId}/lessons`,
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    // Fallback to GET /api/v1/lessons/?chapter_id=
    const response = await apiClient.get<Lesson[]>(`${LESSONS}/`, {
      params: { chapter_id: chapterId },
    });
    const items = Array.isArray(response.data) ? response.data : [];
    return {
      items,
      total: items.length,
      page: 1,
      page_size: 50,
      pages: 1,
    };
  }
}

export async function getLessonById(lessonId: number): Promise<Lesson> {
  const response = await apiClient.get<Lesson>(`${LESSONS}/${lessonId}`);
  return response.data;
}

export async function createLesson(data: CreateLessonRequest): Promise<Lesson> {
  const response = await apiClient.post<Lesson>(`${LESSONS}/`, data);
  return response.data;
}

export async function updateLesson(lessonId: number, data: UpdateLessonRequest): Promise<Lesson> {
  const response = await apiClient.put<Lesson>(`${LESSONS}/${lessonId}`, data);
  return response.data;
}

export async function deleteLesson(lessonId: number): Promise<void> {
  await apiClient.delete(`${LESSONS}/${lessonId}`);
}
