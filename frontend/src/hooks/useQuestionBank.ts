import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  deleteQuestion,
  generateQuestionPreview,
  getAllQuestions,
  getQuestionById,
  getQuestionsByAssessment,
  searchQuestions,
  updateQuestion,
  discoverLessonResources,
  getGenerationJobStatus,
  reviewCandidateQuestion,
  approveAndSaveQuestions,
  retryGenerationJob,
  getResourcePreview,
  getGenerationHistory,
} from "@/lib/services/question.service";
import type {
  PaginatedQuestionResponse,
  Question,
  QuestionCreateRequest,
  QuestionSearchQueryParams,
  QuestionUpdateRequest,
  QuizGenerationRequest,
  CandidateQuestion,
} from "@/types/question";
import { getStoredToken } from "@/lib/api/axios";

export function useSearchQuestions(params?: QuestionSearchQueryParams) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["questions", "search", params],
    queryFn: () => searchQuestions(params),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAllQuestions(assessmentId?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["questions", "all", assessmentId],
    queryFn: () => getAllQuestions(assessmentId),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
  });
}

export function useQuestion(id?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["questions", "detail", id],
    queryFn: () => getQuestionById(id!),
    enabled: Boolean(token && id && id > 0),
    staleTime: 1000 * 60 * 2,
  });
}

export function useQuestionsByAssessment(assessmentId?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["questions", "assessment", assessmentId],
    queryFn: () => getQuestionsByAssessment(assessmentId!),
    enabled: Boolean(token && assessmentId && assessmentId > 0),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionCreateRequest) => createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuestionUpdateRequest }) =>
      updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
    },
  });
}

export function useLessonAiResources(lessonId?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["ai-resources", lessonId],
    queryFn: () => discoverLessonResources(lessonId!),
    enabled: Boolean(token && lessonId && lessonId > 0),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGenerateAiPreview() {
  return useMutation({
    mutationFn: ({
      lessonId,
      request,
    }: {
      lessonId: number;
      request: QuizGenerationRequest;
    }) => generateQuestionPreview(lessonId, request),
  });
}

export function useGenerationJobStatus(lessonId?: number, jobId?: string, enabled = true) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["ai-job-status", lessonId, jobId],
    queryFn: () => getGenerationJobStatus(lessonId!, jobId!),
    enabled: Boolean(token && lessonId && jobId && enabled),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1500;
      if (["READY_FOR_REVIEW", "COMPLETED", "FAILED", "CANCELLED"].includes(data.job_status)) {
        return false;
      }
      return 1500;
    },
  });
}

export function useReviewCandidateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      tempQuestionId,
      updateData,
    }: {
      lessonId: number;
      tempQuestionId: number;
      updateData: Partial<CandidateQuestion>;
    }) => reviewCandidateQuestion(lessonId, tempQuestionId, updateData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-job-status", variables.lessonId] });
    },
  });
}

export function useApproveAiQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      jobId,
    }: {
      lessonId: number;
      jobId: string;
    }) => approveAndSaveQuestions(lessonId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });
    },
  });
}

export function useRetryAiJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      jobId,
    }: {
      lessonId: number;
      jobId: string;
    }) => retryGenerationJob(lessonId, jobId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-job-status", variables.lessonId, variables.jobId] });
    },
  });
}

export function useResourcePreview(lessonId?: number, resourceId?: string) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["ai-resource-preview", lessonId, resourceId],
    queryFn: () => getResourcePreview(lessonId!, resourceId!),
    enabled: Boolean(token && lessonId && resourceId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGenerationHistory(lessonId?: number) {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: ["ai-generation-history", lessonId],
    queryFn: () => getGenerationHistory(lessonId!),
    enabled: Boolean(token && lessonId && lessonId > 0),
    staleTime: 1000 * 30,
  });
}
