// client/src/hooks/useRisk.ts
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { ApiRiskResponse, RiskRequest } from "@/types/risk";
import { useToast } from "@/hooks/use-toast";

export function useRisk() {
  const { toast } = useToast();

  const mutation = useMutation<ApiRiskResponse, any, RiskRequest>({
    mutationFn: (payload: RiskRequest) =>
      apiRequest<ApiRiskResponse>("POST", "/api/risk/calculate", payload),
    onSuccess: () => {
      toast({
        title: "Risk calculated",
        description: "Credit scoring completed.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Risk calculation failed",
        description: err?.message || "Unable to calculate risk.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}
