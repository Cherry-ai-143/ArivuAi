import type { UserRole } from "./auth";

export interface User {
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

export interface UpdateProfileRequest {
  full_name?: string;
  institution_name?: string;
  institution_type?: string;
  education_level?: string;
  course?: string;
  branch?: string;
  semester?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  years_of_experience?: string;
  interests?: string[];
  goals?: string[];
  bio?: string;
  onboarding_completed?: boolean;
  preferred_language?: string;
  timezone?: string;
}

export interface ChangePasswordRequest {
  old_password?: string;
  currentPassword?: string; // mapping fallback for UI forms
  new_password?: string;
  newPassword?: string; // mapping fallback for UI forms
  confirm_password?: string;
  confirmPassword?: string;
}

export interface AvatarResponse {
  message: string;
  avatar_url: string;
}
