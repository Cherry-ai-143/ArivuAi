export type UserRole = "student" | "teacher" | "admin";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  avatar_url?: string | null;
  bio?: string | null;
  institution_name?: string | null;
  institution_type?: string | null;
  education_level?: string | null;
  course?: string | null;
  branch?: string | null;
  semester?: string | null;
  designation?: string | null;
  department?: string | null;
  qualification?: string | null;
  years_of_experience?: string | null;
  interests?: string[] | null;
  goals?: string[] | null;
  onboarding_completed?: boolean;
  preferred_language?: string | null;
  timezone?: string | null;
  created_at?: string;
  updated_at?: string;
}
