export type LessonType = 'Theory' | 'Practical' | 'Lab' | 'Seminar' | 'Workshop';

export interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  description?: string | null;
  order_number: number;
  is_published: boolean;
  duration_minutes?: number;
  type?: LessonType;
  learning_objectives?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateLessonRequest {
  chapter_id: number;
  title: string;
  description?: string | null;
  order_number: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string | null;
  order_number?: number;
  is_published?: boolean;
}

export interface LessonQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  chapter_id?: number;
  course_id?: number;
  is_published?: boolean;
}
