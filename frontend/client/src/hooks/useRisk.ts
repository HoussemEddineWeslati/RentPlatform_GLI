// client/src/hooks/useRisk.ts
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { ApiRiskResponse, RiskRequest } from "@/types/risk";
import { useToast } from "@/hooks/use-toast";
import { apiDownloadRequest } from "@/lib/api";
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


/**
 * A mutation hook for generating and downloading a risk assessment PDF report.
 */
export function useRiskReport() {
  const { toast } = useToast();

  return useMutation<void, Error, RiskRequest>({
    mutationFn: (payload: RiskRequest) =>
      apiDownloadRequest("POST", "/api/risk/report", payload, `Risk-Report-${Date.now()}.pdf`),
    onSuccess: () => {
      toast({
        title: "Report Download Started",
        description: "Your PDF report is being generated.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Report Generation Failed",
        description: err?.message || "Could not generate the PDF report.",
        variant: "destructive",
      });
    },
  });
}
