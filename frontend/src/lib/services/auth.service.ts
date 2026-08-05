import { apiClient, clearStoredToken, setStoredToken } from "@/lib/api/axios";
import { AUTH_LOGIN, AUTH_REGISTER } from "@/lib/api/endpoints";
import type { CurrentUser, LoginRequest, RegisterRequest, TokenResponse } from "@/types/auth";

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await apiClient.post<TokenResponse>(AUTH_LOGIN, formData, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  setStoredToken(response.data.access_token);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<CurrentUser> {
  const response = await apiClient.post<CurrentUser>(AUTH_REGISTER, payload, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export function logout(): void {
  clearStoredToken();
}
