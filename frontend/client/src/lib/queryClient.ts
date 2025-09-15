// client/src/lib/queryClient.ts
import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/lib/api";

function resolveUrlFromQueryKey(queryKey: unknown): string {
  if (Array.isArray(queryKey)) {
    return queryKey.map((p) => String(p)).join("/");
  }
  return String(queryKey);
}

type UnauthorizedBehavior = "returnNull" | "throw";

export function getQueryFn<T>({
  on401,
}: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  return async ({ queryKey }) => {
    const url = resolveUrlFromQueryKey(queryKey);
    try {
      return await apiRequest<T>("GET", url);
    } catch (err) {
      if (on401 === "returnNull" && err instanceof ApiError && err.status === 401) {
        return null as unknown as T;
      }
      throw err;
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // 👈 very important
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      retry: false,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 60,
    },
    mutations: { retry: false },
  },
});
