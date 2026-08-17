import { apiClient } from "@/lib/api/axios";
import { CURRENT_USER, USER_AVATAR, USER_CHANGE_PASSWORD } from "@/lib/api/endpoints";
import type { CurrentUser } from "@/types/auth";
import type { AvatarResponse, ChangePasswordRequest, UpdateProfileRequest, User } from "@/types/user";

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>(CURRENT_USER);
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.put<User>(CURRENT_USER, data);
  return response.data;
}

export async function uploadAvatar(file: File): Promise<AvatarResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<AvatarResponse>(USER_AVATAR, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  const payload = {
    old_password: data.old_password || data.currentPassword,
    new_password: data.new_password || data.newPassword,
    confirm_password: data.confirm_password || data.confirmPassword || data.new_password || data.newPassword,
  };

  const response = await apiClient.post<{ message: string }>(USER_CHANGE_PASSWORD, payload);
  return response.data;
}

export async function deleteAccount(): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(CURRENT_USER);
  return response.data;
}
