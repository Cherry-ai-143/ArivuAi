export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AssessmentType =
  | "QUIZ"
  | "PRACTICE"
  | "CHAPTER_TEST"
  | "MIDTERM"
  | "FINAL";

export type AssessmentScope = "LESSON" | "CHAPTER" | "COURSE";

export interface AssessmentQuestion {
  id: number;
  assessment_id: number;
  question_id: number;
  order_number: number;
  marks: number;
}

export interface Assessment {
  id: number;
  title: string;
  description?: string | null;
  assessment_type: AssessmentType;
  scope: AssessmentScope;
  status: AssessmentStatus;
  course_id: number;
  chapter_id?: number | null;
  lesson_id?: number | null;
  duration_minutes: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  total_marks: number;
  question_count: number;
  assessment_questions: AssessmentQuestion[];
}

export interface AssessmentCreateRequest {
  title: string;
  description?: string | null;
  assessment_type: AssessmentType;
  scope: AssessmentScope;
  status?: AssessmentStatus;
  course_id: number;
  chapter_id?: number | null;
  lesson_id?: number | null;
  duration_minutes: number;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  question_ids: number[];
}

export interface AssessmentUpdateRequest {
  title?: string;
  description?: string | null;
  assessment_type?: AssessmentType;
  scope?: AssessmentScope;
  status?: AssessmentStatus;
  course_id?: number;
  chapter_id?: number | null;
  lesson_id?: number | null;
  duration_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_correct_answers?: boolean;
  question_ids?: number[];
}

export interface AssessmentStatusUpdateRequest {
  status: AssessmentStatus;
}

export interface PublishedAssessment {
  id: number;
  title: string;
  description?: string | null;
  assessment_type: AssessmentType;
  scope: AssessmentScope;
  duration_minutes: number;
  passing_score: number;
  max_attempts: number;
  course_id?: number;
  course_title?: string;
  created_at?: string;
  question_count: number;
  total_marks: number;
  attempts_used: number;
  attempts_remaining: number;
}

export interface StudentTakeQuestion {
  question_id: number;
  order_number: number;
  marks: number;
  question_text: string;
  question_type: string;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
}

export interface StudentTakeAssessment {
  id: number;
  title: string;
  description?: string | null;
  assessment_type: AssessmentType;
  scope: AssessmentScope;
  duration_minutes: number;
  passing_score: number;
  max_attempts: number;
  total_marks: number;
  question_count: number;
  questions: StudentTakeQuestion[];
}

export interface AssessmentAttempt {
  id: number;
  assessment_id: number;
  student_id: number;
  status: "IN_PROGRESS" | "SUBMITTED";
  score?: number | null;
  started_at: string;
  submitted_at?: string | null;
}

export interface AssessmentSubmitRequest {
  answers: {
    question_id: number;
    selected_option: string;
  }[];
}

export interface AssessmentSubmitResponse {
  attempt_id: number;
  assessment_id: number;
  status: "SUBMITTED";
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  correct_count: number;
  incorrect_count: number;
  total_questions: number;
  submitted_at: string;
}