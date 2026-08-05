export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  description?: string | null;
  order_number: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChapterRequest {
  course_id: number;
  title: string;
  description?: string | null;
  order_number: number;
}

export interface UpdateChapterRequest {
  title?: string;
  description?: string | null;
  order_number?: number;
  is_published?: boolean;
}
