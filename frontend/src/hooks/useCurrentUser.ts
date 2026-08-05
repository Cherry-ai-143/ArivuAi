import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/services/user.service";
import { getStoredToken } from "@/lib/api/axios";
import type { User } from "@/types/user";

export const USER_QUERY_KEY = ["currentUser"];

export function useCurrentUser() {
  const token = typeof window !== "undefined" ? getStoredToken() : null;

  return useQuery<User | null>({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      if (!getStoredToken()) {
        return null;
      }
      return await getCurrentUser();
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: false,
  });
}
