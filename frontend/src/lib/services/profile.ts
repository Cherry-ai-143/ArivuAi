import type { UserProfileDetails } from "@/types/user-profile";

const PROFILE_STORAGE_KEY_PREFIX = "arivu_profile_";

export function getStoredProfile(userId: number | string): UserProfileDetails {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Failed to parse stored profile details:", error);
  }

  return {};
}

export function saveStoredProfile(
  userId: number | string,
  details: Partial<UserProfileDetails>
): UserProfileDetails {
  const existing = getStoredProfile(userId);
  const updated: UserProfileDetails = {
    ...existing,
    ...details,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        `${PROFILE_STORAGE_KEY_PREFIX}${userId}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Failed to save profile details:", error);
    }
  }

  return updated;
}
