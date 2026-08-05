import { apiClient } from "@/lib/api/axios";

export interface LessonProgressResponse {
  id: number;
  student_id: number;
  lesson_id: number;
  progress_percentage: number;
  time_spent_seconds: number;
  completed: boolean;
  started_at: string;
  last_accessed: string;
  completed_at?: string | null;
}

export interface CourseProgressResponse {
  course_id: number;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface LessonProgressUpdateRequest {
  progress_percentage: number;
  time_spent_seconds?: number;
}

export async function getCourseProgress(courseId: number): Promise<CourseProgressResponse> {
  try {
    const response = await apiClient.get<CourseProgressResponse>(`/progress/course/${courseId}`);
    return response.data;
  } catch (error) {
    return {
      course_id: courseId,
      progress: 0,
      completed_lessons: 0,
      total_lessons: 0,
    };
  }
}

export async function getLessonProgress(lessonId: number): Promise<LessonProgressResponse | null> {
  try {
    const response = await apiClient.get<LessonProgressResponse>(`/progress/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function updateLessonProgress(
  lessonId: number,
  data: LessonProgressUpdateRequest
): Promise<LessonProgressResponse | null> {
  try {
    const response = await apiClient.put<LessonProgressResponse>(`/progress/lesson/${lessonId}`, data);
    return response.data;
  } catch (error) {
    return null;
  }
}
