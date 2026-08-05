import { apiClient } from "@/lib/api/axios";
import { CHAPTERS } from "@/lib/api/endpoints";
import type {
  Chapter,
  CreateChapterRequest,
  UpdateChapterRequest,
} from "@/types/chapter";

export async function getChaptersByCourse(courseId: number): Promise<Chapter[]> {
  const response = await apiClient.get<Chapter[]>(`${CHAPTERS}/course/${courseId}`);
  return response.data;
}

export async function getChapterById(chapterId: number): Promise<Chapter> {
  const response = await apiClient.get<Chapter>(`${CHAPTERS}/${chapterId}`);
  return response.data;
}

export async function createChapter(data: CreateChapterRequest): Promise<Chapter> {
  const response = await apiClient.post<Chapter>(`${CHAPTERS}/`, data);
  return response.data;
}

export async function updateChapter(chapterId: number, data: UpdateChapterRequest): Promise<Chapter> {
  const response = await apiClient.put<Chapter>(`${CHAPTERS}/${chapterId}`, data);
  return response.data;
}

export async function deleteChapter(chapterId: number): Promise<void> {
  await apiClient.delete(`${CHAPTERS}/${chapterId}`);
}
