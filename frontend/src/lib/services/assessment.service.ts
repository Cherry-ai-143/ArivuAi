import { apiClient } from '@/lib/api/axios'
import { ASSESSMENTS, ASSESSMENT_ATTEMPTS } from '@/lib/api/endpoints'
import type {
  Assessment,
  AssessmentCreateRequest,
  AssessmentUpdateRequest,
  AssessmentStatus,
  AssessmentStatusUpdateRequest,
  PublishedAssessment,
  StudentTakeAssessment,
  AssessmentAttempt,
  AssessmentSubmitResponse,
} from '@/types/assessment'

export interface AssessmentListParams {
  course_id?: number
  status?: AssessmentStatus
  scope?: string
}

export async function getAssessments(
  params?: AssessmentListParams
): Promise<Assessment[]> {
  try {
    const response = await apiClient.get<Assessment[]>(`${ASSESSMENTS}/`, {
      params,
    })
    return response.data || []
  } catch (err) {
    console.error("Failed to fetch assessments:", err)
    return []
  }
}

export async function getAllAssessments(courseId?: number): Promise<Assessment[]> {
  try {
    const response = await apiClient.get<Assessment[]>(`${ASSESSMENTS}/`)
    const assessments = response.data || []
    if (courseId && courseId > 0) {
      return assessments.filter((a) => a.course_id === courseId)
    }
    return assessments
  } catch (err) {
    console.error("Failed to fetch all assessments:", err)
    return []
  }
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

export async function duplicateAssessment(id: number): Promise<Assessment> {
  const original = await getAssessmentById(id)
  const duplicatePayload: AssessmentCreateRequest = {
    title: `${original.title} (Copy)`,
    description: original.description,
    assessment_type: original.assessment_type,
    scope: original.scope,
    status: 'DRAFT',
    course_id: original.course_id,
    chapter_id: original.chapter_id,
    lesson_id: original.lesson_id,
    duration_minutes: original.duration_minutes,
    passing_score: original.passing_score,
    max_attempts: original.max_attempts,
    shuffle_questions: original.shuffle_questions,
    shuffle_options: original.shuffle_options,
    show_correct_answers: original.show_correct_answers,
    question_ids: original.assessment_questions?.map((aq) => aq.question_id || aq.id) || [],
  }
  return createAssessment(duplicatePayload)
}


export async function getPublishedAssessmentForLesson(
  lessonId: number
): Promise<PublishedAssessment | null> {
  const response = await apiClient.get<PublishedAssessment | null>(
    `${ASSESSMENTS}/published/lesson/${lessonId}`
  )
  return response.data
}

export async function getAvailableStudentAssessments(): Promise<PublishedAssessment[]> {
  const response = await apiClient.get<PublishedAssessment[]>(
    `${ASSESSMENTS}/student/available`
  )
  return response.data || []
}

export async function getStudentTakeAssessment(
  assessmentId: number
): Promise<StudentTakeAssessment> {
  const response = await apiClient.get<StudentTakeAssessment>(
    `${ASSESSMENTS}/${assessmentId}/take`
  )
  return response.data
}

export async function startAssessmentAttempt(
  assessmentId: number
): Promise<AssessmentAttempt> {
  const response = await apiClient.post<AssessmentAttempt>(
    `${ASSESSMENT_ATTEMPTS}/`,
    { assessment_id: assessmentId }
  )
  return response.data
}

export async function submitAssessmentAttempt(
  attemptId: number,
  answers: { question_id: number; selected_option: string }[]
): Promise<AssessmentSubmitResponse> {
  const response = await apiClient.put<AssessmentSubmitResponse>(
    `${ASSESSMENT_ATTEMPTS}/${attemptId}/submit`,
    { answers }
  )
  return response.data
}