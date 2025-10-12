//src\hooks\use-config.ts :
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ScoringConfigFormData } from "@/types/schema/configSchema";

// This interface now correctly represents the data INSIDE the 'config' key
interface ScoringConfig {
  name?: string;
  weights: {
    personal: number;
    employment: number;
    financial: number;
    housing: number;
    other: number;
  };
  pdMax: number;
  decisionThresholds: {
    acceptPd: number;
    conditionalPd: number;
  };
}

// This interface represents the FULL API response structure
interface ApiConfigResponse {
  success: boolean;
  config: ScoringConfig;
}

export function useConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ["/api/config/score"];

  const { data: config, isLoading, error } = useQuery<ApiConfigResponse, Error, ScoringConfig>({
    queryKey,
    // ✅ FIX: Use the 'select' option to safely extract the nested 'config' object.
    // The components will now receive the config data directly, or `undefined` while loading,
    // which is the expected behavior.
    select: (response) => response.config,
  });

  const mutation = useMutation({
    mutationFn: (configData: ScoringConfigFormData) =>
      apiRequest("PATCH", "/api/config/score", configData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Configuration Saved",
        description: "Your scoring model settings have been updated.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Save Failed",
        description: err?.message || "Could not save the configuration.",
        variant: "destructive",
      });
    },
  });

  return {
    config, // This is now the correctly shaped object
    isLoading,
    error,
    updateConfig: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
