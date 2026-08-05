import { apiClient } from "@/lib/api/axios";
import { LESSONS, QUESTIONS } from "@/lib/api/endpoints";
import type {
  PaginatedQuestionResponse,
  Question,
  QuestionCreateRequest,
  QuestionSearchQueryParams,
  QuestionUpdateRequest,
  QuizGenerationRequest,
  QuizGenerationResponse,
  DiscoveredResourcesResponse,
  AIGenerationJobStatusResponse,
  CandidateQuestion,
} from "@/types/question";

export async function searchQuestions(
  params?: QuestionSearchQueryParams
): Promise<PaginatedQuestionResponse> {
  const response = await apiClient.get<PaginatedQuestionResponse>(
    `${QUESTIONS}/search`,
    { params }
  );
  return response.data;
}

export async function getAllQuestions(
  assessmentId?: number
): Promise<Question[]> {
  const response = await apiClient.get<Question[]>(`${QUESTIONS}/`, {
    params: assessmentId ? { assessment_id: assessmentId } : undefined,
  });
  return response.data;
}

export async function getQuestionById(id: number): Promise<Question> {
  const response = await apiClient.get<Question>(`${QUESTIONS}/${id}`);
  return response.data;
}

export async function getQuestionsByAssessment(
  assessmentId: number
): Promise<Question[]> {
  const response = await apiClient.get<Question[]>(
    `${QUESTIONS}/assessment/${assessmentId}`
  );
  return response.data;
}

export async function createQuestion(
  data: QuestionCreateRequest
): Promise<Question> {
  const response = await apiClient.post<Question>(`${QUESTIONS}/`, data);
  return response.data;
}

export async function updateQuestion(
  id: number,
  data: QuestionUpdateRequest
): Promise<Question> {
  const response = await apiClient.put<Question>(`${QUESTIONS}/${id}`, data);
  return response.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await apiClient.delete(`${QUESTIONS}/${id}`);
}

export async function discoverLessonResources(
  lessonId: number
): Promise<DiscoveredResourcesResponse> {
  const response = await apiClient.get<DiscoveredResourcesResponse>(
    `/ai/lessons/${lessonId}/ai-resources`
  );
  return response.data;
}

export async function generateQuestionPreview(
  lessonId: number,
  request: QuizGenerationRequest
): Promise<QuizGenerationResponse> {
  const response = await apiClient.post<QuizGenerationResponse>(
    `/ai/lessons/${lessonId}/generate-preview`,
    request
  );
  return response.data;
}

export async function getGenerationJobStatus(
  lessonId: number,
  jobId: string
): Promise<AIGenerationJobStatusResponse> {
  const response = await apiClient.get<AIGenerationJobStatusResponse>(
    `/ai/lessons/${lessonId}/generation-status/${jobId}`
  );
  return response.data;
}

export async function reviewCandidateQuestion(
  lessonId: number,
  tempQuestionId: number,
  updateData: Partial<CandidateQuestion>
): Promise<CandidateQuestion> {
  const response = await apiClient.put<CandidateQuestion>(
    `/ai/lessons/${lessonId}/review-question/${tempQuestionId}`,
    updateData
  );
  return response.data;
}

export async function approveAndSaveQuestions(
  lessonId: number,
  jobId: string
): Promise<{ message: string; count: number }> {
  const response = await apiClient.post<{ message: string; count: number }>(
    `/ai/lessons/${lessonId}/approve-questions/${jobId}`
  );
  return response.data;
}

export async function retryGenerationJob(
  lessonId: number,
  jobId: string
): Promise<QuizGenerationResponse> {
  const response = await apiClient.post<QuizGenerationResponse>(
    `/ai/lessons/${lessonId}/retry-job/${jobId}`
  );
  return response.data;
}

export async function getResourcePreview(
  lessonId: number,
  resourceId: string
): Promise<{ title: string; type: string; text: string; word_count: number }> {
  const response = await apiClient.get<{ title: string; type: string; text: string; word_count: number }>(
    `/ai/lessons/${lessonId}/resource-preview/${resourceId}`
  );
  return response.data;
}

export async function getGenerationHistory(
  lessonId: number
): Promise<Array<{ job_id: string; status: string; created_at: string; total_questions: number; approved_questions: number; progress_message: string }>> {
  const response = await apiClient.get(
    `/ai/lessons/${lessonId}/generation-history`
  );
  return response.data;
}
