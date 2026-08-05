export type QuestionDifficulty = "Easy" | "Medium" | "Hard" | "Beginner" | "Intermediate" | "Advanced" | "Auto";
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "SHORT_ANSWER"
  | "MATCHING"
  | "ORDERING"
  | "MIXED"
  | "Multiple Choice"
  | "True/False"
  | "Fill in the Blanks";
export type BloomLevel = "Knowledge" | "Understanding" | "Application" | "Analysis" | "Evaluation" | "Creation";
export type QuestionStatus = "Draft" | "Approved" | "Published" | "Archived";
export type QuestionSource = "Manual" | "AI Generated";

export interface Question {
  id: number;
  lesson_id?: number;
  lesson_title?: string | null;
  assessment_id?: number | null;
  question_text: string;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
  correct_option?: string | null;
  correct_answer?: string | null;
  marks: number;
  order_number: number;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  bloom_level?: BloomLevel;
  status?: QuestionStatus;
  source?: QuestionSource;
  tags?: string[];
  shuffle_options?: boolean;
  estimated_time_seconds?: number;
  explanation?: string | null;
  version?: number;
  created_at?: string;
  updated_at?: string;
  is_ai_generated?: boolean;
  ai_metadata?: {
    generated_by?: string;
    generated_at?: string;
    source_material?: string;
    confidence_score?: number;
    edited_by_teacher?: boolean;
  };
  usage_stats?: {
    assessments_count?: number;
    success_rate?: number;
    total_attempts?: number;
  };
}

export interface QuestionCreateRequest {
  lesson_id: number;
  assessment_id?: number | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  order_number: number;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  bloom_level?: BloomLevel;
  status?: QuestionStatus;
  source?: QuestionSource;
  tags?: string[];
  shuffle_options?: boolean;
  explanation?: string | null;
}

export interface QuestionUpdateRequest {
  question_text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: string;
  marks?: number;
  order_number?: number;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  bloom_level?: BloomLevel;
  status?: QuestionStatus;
  tags?: string[];
  shuffle_options?: boolean;
  explanation?: string | null;
}

export interface QuestionSearchQueryParams {
  q?: string;
  course_id?: number;
  chapter_id?: number;
  lesson_id?: number;
  assessment_id?: number;
  difficulty?: string;
  type?: string;
  bloom_level?: string;
  status?: string;
  source?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedQuestionResponse {
  items: Question[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface DiscoveredResource {
  id: string;
  db_id?: number;
  type: string;
  title: string;
  word_count: number;
  detail: string;
  enabled_by_default: boolean;
}

export interface DiscoveredResourcesResponse {
  resources: DiscoveredResource[];
  total_words: number;
  estimated_duration_sec: number;
  has_pdf: boolean;
  has_youtube: boolean;
}

export interface CandidateQuestion {
  id: number;
  job_id: string;
  question_text: string;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
  correct_option?: string | null;
  correct_answer?: string | null;
  question_type: string;
  difficulty: QuestionDifficulty;
  bloom_level: BloomLevel;
  explanation?: string;
  source_attribution?: string;
  ai_confidence: number;
  approved: boolean;
  edited: boolean;
  rejected_reason?: string | null;
}

export interface TimelineLog {
  severity: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  stage: string;
  message: string;
  time: string;
}

export interface AIGenerationJobStatusResponse {
  found: boolean;
  job_id: string;
  job_status: "QUEUED" | "RUNNING" | "READY_FOR_REVIEW" | "APPROVED" | "COMPLETED" | "FAILED" | "CANCELLED";
  stage: "EXTRACTING" | "CACHING" | "CHUNKING" | "GENERATING" | "VALIDATING";
  progress: number;
  progress_message?: string;
  failure_reason?: string | null;
  current_chunk: number;
  total_chunks: number;
  elapsed_time: string;
  estimated_remaining: string;
  questions: CandidateQuestion[];
  timeline_logs: TimelineLog[];
  error_message?: string | null;
}

export interface QuizGenerationRequest {
  difficulty?: string;
  difficulty_dist?: string;
  type_dist?: string;
  bloom_level?: string;
  num_questions?: number;
  selected_resource_ids?: string[];
  include_description?: boolean;
}

export interface QuizGenerationResponse {
  job_id: string;
  status: string;
  progress_pct: number;
  progress_message: string;
  total_words: number;
  estimated_duration_sec: number;
}
