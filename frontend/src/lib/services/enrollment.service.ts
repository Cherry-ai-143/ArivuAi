import { apiClient } from "@/lib/api/axios";
import { ENROLLMENTS } from "@/lib/api/endpoints";
import type { Course } from "@/types/course";

export interface CourseEnrollmentResponse {
  id: number;
  student_id: number;
  course_id: number;
  status: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";
  enrolled_at: string;
  course?: Course;
}

export interface CourseEnrollmentStatusResponse {
  is_enrolled: boolean;
  status?: string | null;
  enrolled_at?: string | null;
}

export async function getMyEnrollments(): Promise<CourseEnrollmentResponse[]> {
  try {
    const response = await apiClient.get<CourseEnrollmentResponse[]>(`${ENROLLMENTS}/me`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
}

export async function enrollInCourse(courseId: number): Promise<CourseEnrollmentResponse | null> {
  try {
    const response = await apiClient.post<CourseEnrollmentResponse>(`${ENROLLMENTS}/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to enroll in course:", error);
    return null;
  }
}

export async function getEnrollmentStatus(courseId: number): Promise<CourseEnrollmentStatusResponse> {
  try {
    const response = await apiClient.get<CourseEnrollmentStatusResponse>(`${ENROLLMENTS}/${courseId}`);
    return response.data;
  } catch (error) {
    return { is_enrolled: false };
  }
}

export async function dropCourse(courseId: number): Promise<boolean> {
  try {
    await apiClient.delete(`${ENROLLMENTS}/${courseId}`);
    return true;
  } catch (error) {
    return false;
  }
}
