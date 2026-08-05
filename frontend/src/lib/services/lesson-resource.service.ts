import { apiClient } from "@/lib/api/axios";
import { API_BASE_URL, LESSONS } from "@/lib/api/endpoints";
import type {
  LessonResource,
  LessonResourceCreateRequest,
  LessonResourceGroupedResponse,
  LessonResourceUpdateRequest,
} from "@/types/lesson-resource";

export async function getLessonResources(
  lessonId: number
): Promise<LessonResourceGroupedResponse> {
  const response = await apiClient.get<LessonResourceGroupedResponse>(
    `${LESSONS}/${lessonId}/resources`
  );
  return response.data;
}

export async function uploadLessonResource(
  lessonId: number,
  data: LessonResourceCreateRequest,
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
): Promise<LessonResource> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("resource_type", data.resource_type);
  if (data.file) formData.append("file", data.file);
  if (data.url) formData.append("url", data.url);
  if (data.author) formData.append("author", data.author);
  if (data.description) formData.append("description", data.description);

  const response = await apiClient.post<LessonResource>(
    `${LESSONS}/${lessonId}/resources`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onUploadProgress) {
          onUploadProgress({ loaded: e.loaded, total: e.total });
        }
      },
    }
  );
  return response.data;
}

export async function updateLessonResource(
  lessonId: number,
  resourceId: number,
  data: LessonResourceUpdateRequest
): Promise<LessonResource> {
  const response = await apiClient.put<LessonResource>(
    `${LESSONS}/${lessonId}/resources/${resourceId}`,
    data
  );
  return response.data;
}

export async function deleteLessonResource(
  lessonId: number,
  resourceId: number
): Promise<void> {
  await apiClient.delete(`${LESSONS}/${lessonId}/resources/${resourceId}`);
}

export function getLessonResourceDownloadUrl(lessonId: number, resourceId: number): string {
  return `${API_BASE_URL}${LESSONS}/${lessonId}/resources/${resourceId}/download`;
}
