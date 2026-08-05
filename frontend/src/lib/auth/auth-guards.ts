import type { CurrentUser } from "@/types/auth";

export type UserRole = CurrentUser["role"];

export function getDashboardPathForRole(role: UserRole | string | undefined): string | null {
  if (!role) {
    return null;
  }

  const normalizedRole = String(role).toLowerCase();

  switch (normalizedRole) {
    case "student":
      return "/dashboard";
    case "teacher":
      return "/teacher-dashboard";
    case "admin":
      return "/admin-dashboard";
    default:
      return null;
  }
}

export function isAllowedForRole(role: UserRole | string | undefined, pathname: string): boolean {
  if (pathname.startsWith("/dashboard/courses")) {
    return true;
  }

  if (pathname === "/dashboard" || pathname === "/teacher-dashboard" || pathname === "/admin-dashboard" || pathname.startsWith("/student/") || pathname.startsWith("/teacher/") || pathname.startsWith("/admin/")) {
    const dashboardPath = getDashboardPathForRole(role);
    return dashboardPath === pathname || pathname.startsWith(dashboardPath || "");
  }

  return true;
}

