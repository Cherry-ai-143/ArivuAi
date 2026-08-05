import { apiClient } from "@/lib/api/axios";

export interface UploadedFileResponse {
  id: number;
  lesson_id?: number | null;
  title: string;
  original_filename: string;
  stored_filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
}

export async function uploadFile(
  file: File,
  title: string = "Course Thumbnail",
  lessonId?: number
): Promise<UploadedFileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  if (lessonId) {
    formData.append("lesson_id", String(lessonId));
  }

  const response = await apiClient.post<UploadedFileResponse>("/uploaded-files/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
