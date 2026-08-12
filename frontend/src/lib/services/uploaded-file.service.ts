import { apiClient } from "@/lib/api/axios"

export interface UploadedFileResponse {
  id: number
  lesson_id?: number | null
  course_id?: number | null
  title: string
  original_filename: string
  stored_filename: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_by: number
  created_at: string
}

// purpose : Convert backend upload paths into browser-accessible URLs.
export function getUploadedFileUrl(
  fileUrl?: string | null
): string {
  if (!fileUrl) return "#"

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://") ||
    fileUrl.startsWith("blob:") ||
    fileUrl.startsWith("data:")
  ) {
    return fileUrl
  }

  const backendBase =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
    "http://127.0.0.1:8000"

  if (fileUrl.startsWith("/uploads/")) {
    return `${backendBase}${fileUrl}`
  }

  if (fileUrl.startsWith("uploads/")) {
    return `${backendBase}/${fileUrl}`
  }

  return fileUrl
}

// purpose : Upload a file and optionally associate it with a lesson or course.
export async function uploadFile(
  file: File,
  title: string = "Course Thumbnail",
  lessonId?: number,
  courseId?: number
): Promise<UploadedFileResponse> {
  const formData = new FormData()

  formData.append("file", file)
  formData.append("title", title)

  if (lessonId) {
    formData.append("lesson_id", String(lessonId))
  }

  if (courseId) {
    formData.append("course_id", String(courseId))
  }

  const response = await apiClient.post<UploadedFileResponse>(
    "/uploaded-files/",
    formData
  )

  return response.data
}

// purpose : Fetch uploaded files associated with a specific course.
export async function getCourseUploadedFiles(
  courseId: number
): Promise<UploadedFileResponse[]> {
  const response = await apiClient.get<UploadedFileResponse[]>(
    "/uploaded-files/",
    {
      params: {
        course_id: courseId,
      },
    }
  )

  return response.data
}