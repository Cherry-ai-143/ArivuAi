export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER' | string;

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string | null;
  level: CourseLevel;
  language: string;
  duration_hours: number;
  teacher_id: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Computed / Display fields
  students_count?: number;
  lessons_count?: number;
  completion_rate?: number;
  average_rating?: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnail?: string | null;
  level: CourseLevel;
  language: string;
  duration_hours: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  thumbnail?: string | null;
  level?: CourseLevel;
  language?: string;
  duration_hours?: number;
  is_published?: boolean;
}

export interface CourseQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  level?: string;
  teacher_id?: number;
  my_courses?: boolean;
  is_published?: boolean;
  status?: 'all' | 'published' | 'draft';
}

export interface PaginatedCourseResponse {
  items: Course[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
