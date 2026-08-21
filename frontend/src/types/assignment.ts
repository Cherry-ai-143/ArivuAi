export type AssignmentType =
  | 'WRITTEN'
  | 'PROBLEM_SOLVING'
  | 'PROGRAMMING'
  | 'PROJECT'
  | 'RESEARCH'
  | 'CREATIVE';

export type AssignmentDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AssignmentStatus = 'DRAFT' | 'ACTIVE' | 'PENDING_REVIEW' | 'COMPLETED';

export type SubmissionStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'LATE'
  | 'UNDER_REVIEW'
  | 'GRADED'
  | 'RETURNED'
  | 'RESUBMISSION_REQUIRED';

export type GradingMethod = 'MANUAL' | 'RUBRIC' | 'AI_ASSISTED';

export interface RubricCriterion {
  id?: number;
  criterion_name: string;
  max_points: number;
  description?: string;
  order_index?: number;
}

export interface SubmissionConfig {
  allowed_methods?: ('text' | 'file' | 'url')[];
  allowed_file_types?: string[];
  max_file_size_mb?: number;
  max_files_count?: number;
}

export interface GradingConfig {
  grading_method?: GradingMethod;
  enable_ai_assistance?: boolean;
  rubric_enabled?: boolean;
}

export interface TypeConfig {
  language?: string;
  allow_repo_url?: boolean;
  allow_zip?: boolean;
  required_concepts?: string[];
  step_by_step_required?: boolean;
  calculator_allowed?: boolean;
  min_word_count?: number;
  max_word_count?: number;
  citation_format?: string;
  required_sections?: string[];
  accepted_media_formats?: string[];
}

export interface Assignment {
  id: number;
  course_id: number;
  lesson_id?: number | null;
  teacher_id: number;
  title: string;
  description: string;
  instructions: string;
  assignment_type: AssignmentType;
  difficulty: AssignmentDifficulty;
  max_points: number;
  due_date?: string | null;
  status: AssignmentStatus | SubmissionStatus;
  submission_config?: SubmissionConfig | null;
  grading_config?: GradingConfig | null;
  type_config?: TypeConfig | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;

  course_title?: string | null;
  lesson_title?: string | null;
  total_submissions?: number;
  total_enrolled?: number;
  average_score?: number | null;
  pending_review_count?: number;
  rubric_criteria?: RubricCriterion[];
  my_submission?: Submission | null;
}

export interface SubmissionFile {
  id?: number | string;
  title?: string;
  filename: string;
  url: string;
  file_size?: number;
  mime_type?: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  status: SubmissionStatus;
  text_response?: string | null;
  external_url?: string | null;
  file_ids?: SubmissionFile[] | null;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
  is_late: boolean;
  score?: number | null;
  feedback?: string | null;
  rubric_scores?: Record<string, number> | null;
  graded_at?: string | null;
  graded_by?: number | null;
  resubmission_reason?: string | null;

  student_name?: string | null;
  student_email?: string | null;
  student_avatar?: string | null;
  assignment_title?: string | null;
  assignment_max_points?: number | null;
  assignment_instructions?: string | null;
  assignment_type?: AssignmentType | null;
  rubric_criteria?: RubricCriterion[];
}

export interface AssignmentStats {
  total_assignments: number;
  active_assignments: number;
  pending_review_count: number;
  average_submission_rate: number;
  average_score: number;
}

export interface AIAssignmentGenRequest {
  course_id: number;
  lesson_id?: number | null;
  topic: string;
  assignment_type?: AssignmentType;
  difficulty?: AssignmentDifficulty;
  task_count?: number;
  custom_directives?: string;
  custom_prompt?: string;
}

export interface AIAssignmentGenResponse {
  title: string;
  description: string;
  instructions: string;
  tasks?: { title: string; description: string; points: number }[];
  assignment_type: AssignmentType;
  difficulty: AssignmentDifficulty;
  max_points: number;
  submission_config: SubmissionConfig;
  grading_config?: GradingConfig;
  type_config: TypeConfig;
  rubric_criteria: RubricCriterion[];
  optional_teacher_notes?: string;
}


export interface AIGradingAnalysisResponse {
  suggested_score: number;
  max_points: number;
  rubric_breakdown?: Record<string, number>;
  strengths: string[];
  areas_for_improvement: string[];
  suggested_feedback: string;
}
