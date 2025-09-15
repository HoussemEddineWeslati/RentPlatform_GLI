// client/src/hooks/use-auth.ts
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/schema";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }), // 👈 this avoids crashes
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user,
    isLoading,
    error, // 👈 expose error so you can log/debug
    isAuthenticated: !!user,
  };
}
