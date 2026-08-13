"use client";

// purpose : Manage authentication state and clear user-specific React Query
// data whenever the authenticated user changes.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "@/contexts/AuthContext";

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
} from "@/lib/api";

import {
  updateProfile as updateProfileApi,
} from "@/lib/services/user.service";

import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/api/axios";

import {
  getApiErrorMessage,
} from "@/lib/api/errors";

import {
  getDashboardPathForRole,
} from "@/lib/auth/auth-guards";

import type {
  CurrentUser,
  LoginRequest,
} from "@/types/auth";

import type {
  UserProfileDetails,
} from "@/types/user-profile";


interface AuthProviderProps {
  children: React.ReactNode;
}


export function AuthProvider({
  children,
}: AuthProviderProps) {

  const router = useRouter();

  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState<string | null>(null);


  // purpose : Derive profile information from the authenticated user
  // so profile state always follows the current account.
  const profileDetails =
    useMemo<UserProfileDetails>(() => {

      if (!currentUser) {
        return {};
      }

      return {
        bio: currentUser.bio || "",
        avatarUrl: currentUser.avatar_url || "",
        institutionName:
          currentUser.institution_name || "",
        institutionType:
          currentUser.institution_type || "",
        education:
          currentUser.education_level || "",
        course:
          currentUser.course || "",
        branch:
          currentUser.branch || "",
        semester:
          currentUser.semester || "",
        designation:
          currentUser.designation || "",
        department:
          currentUser.department || "",
        qualification:
          currentUser.qualification || "",
        experience:
          currentUser.years_of_experience || "",
        learningInterests:
          currentUser.interests || [],
        subjects:
          currentUser.interests || [],
        goals:
          currentUser.goals || [],
        teachingGoals:
          currentUser.goals || [],
        hasCompletedOnboarding:
          currentUser.onboarding_completed || false,
      };

    }, [currentUser]);


  const setAuthState = useCallback(
    (
      user: CurrentUser | null,
      authToken: string | null,
      loading = false
    ) => {

      setCurrentUser(user);

      setToken(authToken);

      setIsLoading(loading);

      if (!authToken) {
        setAuthError(null);
      }

    },
    []
  );


  const refreshUser = useCallback(
    async () => {

      const storedToken =
        getStoredToken();

      if (!storedToken) {

        setCurrentUser(null);
        setToken(null);
        setIsLoading(false);
        setAuthError(null);

        return null;
      }

      try {

        const user =
          await getCurrentUser();

        setCurrentUser(user);

        setToken(storedToken);

        setIsLoading(false);

        setAuthError(null);

        return user;

      } catch (error) {

        // purpose : Remove stale authentication and cached data when
        // the stored token is no longer valid.
        clearStoredToken();

        setCurrentUser(null);

        setToken(null);

        setIsLoading(false);

        setAuthError(
          getApiErrorMessage(error)
        );

        return null;
      }

    },
    []
  );


  // purpose : Initialize the authenticated user when the application starts.
  useEffect(() => {

    const initializeAuth =
      async () => {

        await refreshUser();

      };

    initializeAuth();

  }, [refreshUser]);


  // purpose : Keep authentication state synchronized between browser tabs.
  useEffect(() => {

    if (typeof window === "undefined") {
      return;
    }

    const handleStorage =
      (event: StorageEvent) => {

        if (
          event.key === "auth_token" &&
          !event.newValue
        ) {

          // purpose : Remove all cached authenticated data when another
          // browser tab logs the user out.
          queryClient.clear();

          clearStoredToken();

          setCurrentUser(null);

          setToken(null);

          setAuthError(null);

          setIsLoading(false);
        }

      };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {

      window.removeEventListener(
        "storage",
        handleStorage
      );

    };

  }, [queryClient]);


  const login = useCallback(
    async (
      credentials: LoginRequest
    ) => {

      setIsLoading(true);

      setAuthError(null);

      // purpose : Remove the previous account's cached server data
      // before starting a new authentication session.
      queryClient.clear();

      try {

        const tokenResponse =
          await loginApi(credentials);

        setStoredToken(
          tokenResponse.access_token
        );

        const user =
          await getCurrentUser();

        setAuthState(
          user,
          tokenResponse.access_token,
          false
        );

        // purpose : Make sure no cached data belonging to the previous
        // authenticated account survives the new login.
        queryClient.clear();

        if (user?.role) {

          const dest =
            getDashboardPathForRole(
              user.role
            ) ?? "/login";

          router.replace(dest);
        }

        return user;

      } catch (error) {

        clearStoredToken();

        queryClient.clear();

        setCurrentUser(null);

        setToken(null);

        setAuthError(
          getApiErrorMessage(error)
        );

        setIsLoading(false);

        throw error;
      }

    },
    [
      router,
      setAuthState,
      queryClient,
    ]
  );


  const logout = useCallback(
    async () => {

      // purpose : Remove the current user's server/cache state before
      // switching to the login screen.
      logoutApi();

      clearStoredToken();

      queryClient.clear();

      setCurrentUser(null);

      setToken(null);

      setAuthError(null);

      setIsLoading(false);

      router.replace("/login");

    },
    [
      router,
      queryClient,
    ]
  );


  const updateProfile = useCallback(
    (
      details: Partial<UserProfileDetails>
    ) => {

      setCurrentUser((prev) => {

        if (!prev) {
          return null;
        }

        return {
          ...prev,

          bio:
            details.bio ??
            prev.bio,

          avatar_url:
            details.avatarUrl ??
            prev.avatar_url,

          institution_name:
            details.institutionName ??
            prev.institution_name,

          institution_type:
            details.institutionType ??
            prev.institution_type,

          education_level:
            details.education ??
            prev.education_level,

          course:
            details.course ??
            prev.course,

          branch:
            details.branch ??
            prev.branch,

          semester:
            details.semester ??
            prev.semester,

          designation:
            details.designation ??
            prev.designation,

          department:
            details.department ??
            prev.department,

          qualification:
            details.qualification ??
            prev.qualification,

          years_of_experience:
            details.experience ??
            prev.years_of_experience,

          interests:
            details.subjects ||
            details.learningInterests ||
            prev.interests,

          goals:
            details.teachingGoals ||
            details.goals ||
            prev.goals,

          onboarding_completed:
            details.hasCompletedOnboarding ??
            prev.onboarding_completed,
        };

      });

    },
    []
  );


  const completeOnboarding = useCallback(
    async (
      details: Partial<UserProfileDetails>
    ) => {

      try {

        const updatedUser =
          await updateProfileApi({

            institution_name:
              details.institutionName,

            institution_type:
              details.institutionType,

            education_level:
              details.education,

            course:
              details.course,

            branch:
              details.branch,

            semester:
              details.semester,

            designation:
              details.designation,

            department:
              details.department,

            qualification:
              details.qualification,

            years_of_experience:
              details.experience,

            interests:
              details.subjects ||
              details.learningInterests,

            goals:
              details.teachingGoals ||
              details.goals,

            bio:
              details.bio,

            onboarding_completed:
              true,

          });


        setCurrentUser((prev) => {

          if (!prev) {
            return updatedUser;
          }

          return {
            ...updatedUser,

            avatar_url:
              details.avatarUrl ??
              prev.avatar_url,
          };

        });


        queryClient.invalidateQueries({
          queryKey: ["currentUser"],
        });


        const destination =
          getDashboardPathForRole(
            updatedUser.role
          ) || "/dashboard";

        router.replace(destination);

      } catch (error) {

        // purpose : Keep the existing optimistic fallback if profile
        // update fails on the server.
        updateProfile({
          ...details,
          hasCompletedOnboarding: true,
        });

        queryClient.invalidateQueries({
          queryKey: ["currentUser"],
        });

      }

    },
    [
      queryClient,
      router,
      updateProfile,
    ]
  );


  const value =
    useMemo(
      () => ({
        currentUser,
        profileDetails,
        token,
        isAuthenticated:
          Boolean(
            token &&
            currentUser
          ),
        isLoading,
        login,
        logout,
        refreshUser,
        setAuthState,
        updateProfile,
        completeOnboarding,
      }),
      [
        currentUser,
        profileDetails,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        setAuthState,
        updateProfile,
        completeOnboarding,
      ]
    );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}