import { apiClient } from "@/lib/api/axios";
import { DASHBOARD } from "@/lib/api/endpoints";
import type {
  AdminDashboardResponse,
  StudentDashboardResponse,
  TeacherDashboardResponse,
} from "@/types/dashboard";

export async function getStudentDashboard(): Promise<StudentDashboardResponse> {
  const response = await apiClient.get<StudentDashboardResponse>(`${DASHBOARD}/student`);
  return response.data;
}

export async function getTeacherDashboard(): Promise<TeacherDashboardResponse> {
  const response = await apiClient.get<TeacherDashboardResponse>(`${DASHBOARD}/teacher`);
  return response.data;
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiClient.get<AdminDashboardResponse>(`${DASHBOARD}/admin`);
  return response.data;
}
