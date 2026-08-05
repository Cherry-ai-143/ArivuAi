/**
 * Centralized Query Keys Factory for TanStack Query
 */
export const queryKeys = {
  auth: {
    currentUser: ["currentUser"] as const,
  },
  dashboard: {
    student: ["dashboard", "student"] as const,
    teacher: ["dashboard", "teacher"] as const,
    admin: ["dashboard", "admin"] as const,
  },
  courses: {
    all: ["courses"] as const,
    list: (filters?: Record<string, unknown>) => ["courses", "list", filters] as const,
    detail: (id: number | string) => ["courses", "detail", id] as const,
  },
  chapters: {
    byCourse: (courseId: number | string) => ["chapters", "byCourse", courseId] as const,
  },
  lessons: {
    byChapter: (chapterId: number | string) => ["lessons", "byChapter", chapterId] as const,
    resources: (lessonId: number | string) => ["lessons", "resources", lessonId] as const,
  },
  questions: {
    list: (filters?: Record<string, unknown>) => ["questions", "list", filters] as const,
    search: (query: string) => ["questions", "search", query] as const,
  },
};
