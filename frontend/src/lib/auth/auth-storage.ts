import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api";

export function readStoredAuthToken(): string | null {
  return getStoredToken();
}

export function persistAuthToken(token: string): void {
  setStoredToken(token);
}

export function clearAuthToken(): void {
  clearStoredToken();
}
