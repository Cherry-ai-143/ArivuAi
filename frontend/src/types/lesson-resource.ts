export type ResourceType =
  | "PDF"
  | "PowerPoint"
  | "Word"
  | "Text"
  | "Video"
  | "Audio"
  | "Image"
  | "ZIP"
  | "YouTube"
  | "GitHub"
  | "Website"
  | "Reference Book"
  | "Other";

export interface LessonResource {
  id: number;
  lesson_id: number;
  title: string;
  resource_type: ResourceType | string;
  url?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  author?: string | null;
  description?: string | null;
  order_number?: number;
  visibility?: "Published" | "Draft" | "Hidden";
  created_at: string;
}

export interface LessonResourceCreateRequest {
  title: string;
  resource_type: string;
  file?: File | null;
  url?: string | null;
  author?: string | null;
  description?: string | null;
}

export interface LessonResourceUpdateRequest {
  title?: string;
  resource_type?: string;
  url?: string | null;
  author?: string | null;
  description?: string | null;
}

export interface LessonResourceGroupedResponse {
  pdfs: LessonResource[];
  videos: LessonResource[];
  youtube: LessonResource[];
  github: LessonResource[];
  ppt: LessonResource[];
  books: LessonResource[];
  notes: LessonResource[];
  links: LessonResource[];
  all_resources: LessonResource[];
}
