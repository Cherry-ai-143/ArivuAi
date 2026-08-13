// purpose : Centralize TanStack Query keys and keep authenticated course data
// isolated between different logged-in users.

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

    // purpose : Include the authenticated user's ID in the course-list cache key
    // so one teacher can never reuse another teacher's cached course result.
    list: (
      filters?: Record<string, unknown>,
      userId?: number | string | null
    ) => ["courses", "list", userId ?? "anonymous", filters] as const,

    detail: (id: number | string) =>
      ["courses", "detail", id] as const,
  },

  chapters: {
    byCourse: (courseId: number | string) =>
      ["chapters", "byCourse", courseId] as const,
  },

  lessons: {
    byChapter: (chapterId: number | string) =>
      ["lessons", "byChapter", chapterId] as const,

    resources: (lessonId: number | string) =>
      ["lessons", "resources", lessonId] as const,
  },

  questions: {
    list: (filters?: Record<string, unknown>) =>
      ["questions", "list", filters] as const,

    search: (query: string) =>
      ["questions", "search", query] as const,
  },
};