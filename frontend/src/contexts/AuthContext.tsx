"use client";

import { createContext } from "react";

import type { CurrentUser, LoginRequest } from "@/types/auth";
import type { UserProfileDetails } from "@/types/user-profile";

interface AuthContextValue {
  currentUser: CurrentUser | null;
  profileDetails: UserProfileDetails;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CurrentUser | null>;
  setAuthState: (user: CurrentUser | null, authToken: string | null, isLoading?: boolean) => void;
  updateProfile: (details: Partial<UserProfileDetails>) => void;
  completeOnboarding: (details: Partial<UserProfileDetails>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export { AuthContext };
export type { AuthContextValue };
