// client/src/hooks/useRiskReport.ts
import type { RiskReportRequest, RiskResponse } from "@/types/risk";

export async function downloadRiskReport(payload: RiskReportRequest, riskResult: RiskResponse) {
  const fullUrl = `${
    import.meta.env.VITE_API_URL ?? "http://localhost:5000"
  }/api/risk/report`;

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, riskResult }),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Tenant_Risk_Report.pdf`;
  link.click();

  window.URL.revokeObjectURL(url);
}
