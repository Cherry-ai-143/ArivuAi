import { apiClient } from '@/lib/api/axios'
import { ASSESSMENTS } from '@/lib/api/endpoints'
import type {
  Assessment,
  AssessmentCreateRequest,
  AssessmentUpdateRequest,
  AssessmentStatus,
  AssessmentStatusUpdateRequest,
  PublishedAssessment,
} from '@/types/assessment'

export interface AssessmentListParams {
  course_id?: number
  status?: AssessmentStatus
  scope?: string
}

export async function getAssessments(
  params?: AssessmentListParams
): Promise<Assessment[]> {
  const response = await apiClient.get<Assessment[]>(`${ASSESSMENTS}/`, {
    params,
  })
  return response.data || []
}

export async function getAllAssessments(courseId?: number): Promise<Assessment[]> {
  const response = await apiClient.get<Assessment[]>(`${ASSESSMENTS}/`)
  const assessments = response.data || []
  if (courseId && courseId > 0) {
    return assessments.filter((a) => a.course_id === courseId)
  }
  return assessments
}

export async function getAssessmentById(id: number): Promise<Assessment> {
  const response = await apiClient.get<Assessment>(`${ASSESSMENTS}/${id}`)
  return response.data
}

export async function createAssessment(
  data: AssessmentCreateRequest
): Promise<Assessment> {
  const response = await apiClient.post<Assessment>(`${ASSESSMENTS}/`, data)
  return response.data
}

export async function updateAssessment(
  id: number,
  data: AssessmentUpdateRequest
): Promise<Assessment> {
  const response = await apiClient.put<Assessment>(`${ASSESSMENTS}/${id}`, data)
  return response.data
}

export async function updateAssessmentStatus(
  id: number,
  status: AssessmentStatus
): Promise<Assessment> {
  const payload: AssessmentStatusUpdateRequest = { status }
  const response = await apiClient.patch<Assessment>(
    `${ASSESSMENTS}/${id}/status`,
    payload
  )
  return response.data
}

export async function deleteAssessment(id: number): Promise<void> {
  await apiClient.delete(`${ASSESSMENTS}/${id}`)
}

export async function getPublishedAssessmentForLesson(
  lessonId: number
): Promise<PublishedAssessment | null> {
  const response = await apiClient.get<PublishedAssessment | null>(
    `${ASSESSMENTS}/published/lesson/${lessonId}`
  )
  return response.data
}