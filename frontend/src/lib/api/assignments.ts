import apiClient from './axios';
import { ASSIGNMENTS, SUBMISSIONS } from './endpoints';
import {
  AIAssignmentGenRequest,
  AIAssignmentGenResponse,
  AIGradingAnalysisResponse,
  Assignment,
  AssignmentStats,
  Submission,
} from '@/types/assignment';

export interface ListAssignmentParams {
  status?: string;
  course_id?: number;
  assignment_type?: string;
  difficulty?: string;
  search?: string;
}

export const assignmentApi = {
  // List assignments (Teacher or Student view)
  list: async (params?: ListAssignmentParams): Promise<Assignment[]> => {
    const res = await apiClient.get<Assignment[]>(ASSIGNMENTS, { params });
    return res.data;
  },

  // Get teacher summary statistics
  getStats: async (): Promise<AssignmentStats> => {
    const res = await apiClient.get<AssignmentStats>(`${ASSIGNMENTS}/stats`);
    return res.data;
  },

  // Generate assignment draft with AI
  generateAI: async (data: AIAssignmentGenRequest, config?: import('axios').AxiosRequestConfig): Promise<AIAssignmentGenResponse> => {
    const res = await apiClient.post<AIAssignmentGenResponse>(`${ASSIGNMENTS}/generate-ai`, data, config);
    return res.data;
  },


  // Get assignment detail
  getDetail: async (id: number | string): Promise<Assignment> => {
    const res = await apiClient.get<Assignment>(`${ASSIGNMENTS}/${id}`);
    return res.data;
  },

  // Create assignment
  create: async (data: Partial<Assignment>): Promise<Assignment> => {
    const res = await apiClient.post<Assignment>(ASSIGNMENTS, data);
    return res.data;
  },

  // Update assignment
  update: async (id: number | string, data: Partial<Assignment>): Promise<Assignment> => {
    const res = await apiClient.put<Assignment>(`${ASSIGNMENTS}/${id}`, data);
    return res.data;
  },

  // Publish assignment
  publish: async (id: number | string): Promise<Assignment> => {
    const res = await apiClient.post<Assignment>(`${ASSIGNMENTS}/${id}/publish`);
    return res.data;
  },

  // Duplicate assignment
  duplicate: async (id: number | string): Promise<Assignment> => {
    const res = await apiClient.post<Assignment>(`${ASSIGNMENTS}/${id}/duplicate`);
    return res.data;
  },

  // Delete assignment
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(`${ASSIGNMENTS}/${id}`);
  },

  // Get student's active submission
  getMySubmission: async (assignmentId: number | string): Promise<Submission | null> => {
    const res = await apiClient.get<Submission | null>(`${ASSIGNMENTS}/${assignmentId}/my-submission`);
    return res.data;
  },

  // Submit or save draft submission
  submitAssignment: async (
    assignmentId: number | string,
    data: { text_response?: string; external_url?: string; file_ids?: any[]; is_draft?: boolean }
  ): Promise<Submission> => {
    const res = await apiClient.post<Submission>(`${ASSIGNMENTS}/${assignmentId}/submissions`, data);
    return res.data;
  },

  // List student submissions for teacher review
  listSubmissions: async (assignmentId: number | string): Promise<Submission[]> => {
    const res = await apiClient.get<Submission[]>(`${ASSIGNMENTS}/${assignmentId}/submissions`);
    return res.data;
  },

  // Get submission detail
  getSubmissionDetail: async (submissionId: number | string): Promise<Submission> => {
    const res = await apiClient.get<Submission>(`${SUBMISSIONS}/${submissionId}`);
    return res.data;
  },

  // Grade submission
  gradeSubmission: async (
    submissionId: number | string,
    data: { score: number; feedback?: string; rubric_scores?: Record<string, number> }
  ): Promise<Submission> => {
    const res = await apiClient.post<Submission>(`${SUBMISSIONS}/${submissionId}/grade`, data);
    return res.data;
  },

  // Analyze submission with AI
  analyzeSubmissionAI: async (submissionId: number | string): Promise<AIGradingAnalysisResponse> => {
    const res = await apiClient.post<AIGradingAnalysisResponse>(`${SUBMISSIONS}/${submissionId}/analyze-ai`);
    return res.data;
  },

  // Request resubmission
  requestResubmission: async (submissionId: number | string, reason: string): Promise<Submission> => {
    const res = await apiClient.post<Submission>(`${SUBMISSIONS}/${submissionId}/request-resubmission`, { reason });
    return res.data;
  },
};
