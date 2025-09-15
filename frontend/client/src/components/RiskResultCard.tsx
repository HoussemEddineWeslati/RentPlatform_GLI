// client/src/components/RiskResultCard.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

type Props = {
  result: import("@/types/risk").RiskResponse | null;
};

export default function RiskResultCard({ result }: Props) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Result</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No calculation yet. Fill the form and click Calculate Risk.</p>
        </CardContent>
      </Card>
    );
  }

  const { safetyScore, PD_12m, decision, components, explanations } = result;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Risk Assessment</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{safetyScore}</div>
          <div className="text-sm text-muted-foreground">Safety Score (0-100)</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">PD (12 months)</p>
            <p className="font-medium">{(PD_12m * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Decision</p>
            <p className="font-medium capitalize">{decision.replace("_", " ")}</p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground">Component breakdown</p>
          <ul className="text-sm mt-2 space-y-1">
            {Object.entries(components).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="capitalize">{k}</span>
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-muted-foreground">Notes</p>
          <ul className="list-disc pl-5 text-sm mt-2">
            {explanations.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
