// src/hooks/use-auth.ts
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/schema";
import { getQueryFn } from "@/lib/queryClient";

// Define the API response type
type UserApiResponse = {
  success: boolean;
  data: User;
} | User | null;

export function useAuth() {
  const { data: userResponse, isLoading, error } = useQuery<UserApiResponse>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });

  // Extract user from response (handle both formats)
  const user = userResponse && typeof userResponse === 'object' && 'data' in userResponse 
    ? userResponse.data 
    : userResponse as User | null;

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}