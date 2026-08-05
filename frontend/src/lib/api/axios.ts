import axios, { AxiosHeaders } from "axios";

import { API_BASE_URL } from "./endpoints";

export const TOKEN_STORAGE_KEY = "auth_token";

/**
 * Retrieve the stored JWT from browser storage.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Persist the JWT for future requests.
 */
export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

/**
 * Remove the stored JWT.
 */
export function clearStoredToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    const headers = new AxiosHeaders(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredToken();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
