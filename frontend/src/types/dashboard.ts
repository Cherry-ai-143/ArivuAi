export interface StudentDashboardUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  onboarding_completed: boolean;
}

export interface StudentDashboardStatistics {
  total_courses: number;
  completed_courses: number;
  hours_spent: number;
  average_score: number;
  quizzes_taken: number;
}

export interface ContinueLearningCourse {
  id: number;
  title: string;
  description?: string;
  progress_percentage?: number;
  level?: string;
}

export interface PendingQuiz {
  id: number;
  title: string;
  total_marks?: number;
  duration_minutes?: number;
}

export interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_active: string;
}

export interface StudentDashboardAnalytics {
  weekly_hours: number[];
  score_trend: number[];
}

export interface DashboardNotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at?: string | null;
}

export interface DashboardActivityItem {
  id: number;
  type: string;
  title: string;
  score?: number;
  created_at?: string | null;
}

export interface StudentDashboardResponse {
  user: StudentDashboardUser;
  statistics: StudentDashboardStatistics;
  continue_learning: ContinueLearningCourse[];
  recent_lessons: unknown[];
  pending_quizzes: PendingQuiz[];
  recommended_courses: ContinueLearningCourse[];
  recommended_quizzes: PendingQuiz[];
  learning_streak: LearningStreak;
  analytics: StudentDashboardAnalytics;
  notifications: DashboardNotificationItem[];
  recent_activity: DashboardActivityItem[];
}

export interface TeacherDashboardStatistics {
  total_courses: number;
  total_students: number;
  total_assessments: number;
  total_questions: number;
  total_uploads: number;
}

export interface TeacherCourseSummary {
  id: number;
  title: string;
  description?: string;
  level?: string;
  is_published: boolean;
  students_count?: number;
}

export interface RecentAssessmentSummary {
  id: number;
  title: string;
  total_marks?: number;
  duration_minutes?: number;
}

export interface StudentPerformanceSummary {
  average_class_score: number;
  pass_rate: string;
  top_performer: string;
}

export interface TeacherDashboardAnalytics {
  monthly_enrollment: number[];
  quiz_completion_rate: string;
}

export interface QuestionBankSummary {
  easy: number;
  medium: number;
  hard: number;
}

export interface TeacherDashboardResponse {
  statistics: TeacherDashboardStatistics;
  courses: TeacherCourseSummary[];
  recent_assessments: RecentAssessmentSummary[];
  student_performance: StudentPerformanceSummary;
  analytics: TeacherDashboardAnalytics;
  recent_activity: DashboardActivityItem[];
  notifications: DashboardNotificationItem[];
  uploads: unknown[];
  question_bank: QuestionBankSummary;
}

export interface AdminUsersSummary {
  total: number;
  teachers: number;
  students: number;
  active_today: number;
}

export interface AdminUserListItem {
  id: number;
  full_name: string;
  email: string;
}

export interface AdminCoursesSummary {
  total: number;
  published: number;
  drafts: number;
}

export interface AdminLessonsSummary {
  total: number;
}

export interface AdminUploadsSummary {
  total_files: number;
  total_storage_mb: number;
}

export interface AdminAnalyticsSummary {
  platform_growth: string;
  active_sessions: number;
}

export interface AdminSystemHealth {
  status: string;
  database: string;
  storage: string;
  uptime: string;
}

export interface AdminDashboardResponse {
  users: AdminUsersSummary;
  teachers: AdminUserListItem[];
  students: AdminUserListItem[];
  courses: AdminCoursesSummary;
  lessons: AdminLessonsSummary;
  uploads: AdminUploadsSummary;
  analytics: AdminAnalyticsSummary;
  system_health: AdminSystemHealth;
  notifications: DashboardNotificationItem[];
  recent_activity: DashboardActivityItem[];
}
