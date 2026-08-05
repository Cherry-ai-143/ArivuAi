import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  getAdminDashboard,
  getStudentDashboard,
  getTeacherDashboard,
} from "@/lib/services/dashboard.service";
import { getStoredToken } from "@/lib/api/axios";

export function useStudentDashboard() {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: queryKeys.dashboard.student,
    queryFn: () => getStudentDashboard(),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2, // 2 mins
    retry: 1,
  });
}

export function useTeacherDashboard() {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: queryKeys.dashboard.teacher,
    queryFn: () => getTeacherDashboard(),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2, // 2 mins
    retry: 1,
  });
}

export function useAdminDashboard() {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: () => getAdminDashboard(),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2, // 2 mins
    retry: 1,
  });
}
