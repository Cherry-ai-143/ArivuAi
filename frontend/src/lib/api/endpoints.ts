/**
 * API endpoint constants
 */

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api/v1";

// Authentication
export const AUTH_LOGIN = "/auth/login";
export const AUTH_REGISTER = "/users/";

// Users & Profile
export const USERS = "/users";
export const CURRENT_USER = "/users/me";
export const USER_AVATAR = "/users/avatar";
export const USER_CHANGE_PASSWORD = "/users/change-password";

// Courses & Content
export const COURSES = "/courses";
export const CHAPTERS = "/chapters";
export const LESSONS = "/lessons";
export const QUESTIONS = "/questions";
export const ASSESSMENTS = "/assessments";
export const ASSESSMENT_ATTEMPTS = "/assessment-attempts";
export const AI = "/ai";
export const UPLOADS = "/uploads";
export const ANALYTICS = "/analytics";
export const DASHBOARD = "/dashboard";
export const NOTIFICATIONS = "/notifications";
export const SEARCH = "/search";
export const ENROLLMENTS = "/enrollments";