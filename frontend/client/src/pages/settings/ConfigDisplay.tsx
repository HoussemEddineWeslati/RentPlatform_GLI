// src/pages/settings/ConfigDisplay.tsx
import { useConfig } from "@/hooks/use-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DataPoint = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b last:border-b-0">
    <span className="text-sm text-muted-foreground mb-1 sm:mb-0">{label}</span>
    <span className="text-sm font-medium text-foreground text-left sm:text-right">{value}</span>
  </div>
);

export function ConfigDisplay() {
  const { config, isLoading, error } = useConfig();

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading Configuration...</CardTitle>
                <CardDescription>Fetching the latest settings from the server.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  if (error || !config) {
    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Failed to Load Configuration</CardTitle>
                <CardDescription>
                There was an error fetching the settings. Please try refreshing the page.
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Current Scoring Configuration</CardTitle>
        <div className="flex items-center justify-between pt-1">
            <CardDescription>
                This is the active model for all tenant risk assessments.
            </CardDescription>
            {config.name && <Badge variant="outline">{config.name}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-muted/30">
          <CardHeader><h4 className="font-semibold">Component Weights</h4></CardHeader>
          <CardContent>
            <DataPoint label="Personal Factors" value={`${config.weights.personal} pts`} />
            <DataPoint label="Employment & Income" value={`${config.weights.employment} pts`} />
            <DataPoint label="Financial Stability" value={`${config.weights.financial} pts`} />
            <DataPoint label="Housing History" value={`${config.weights.housing} pts`} />
            <DataPoint label="Other Factors" value={`${config.weights.other} pts`} />
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30">
          <CardHeader><h4 className="font-semibold">Decision Thresholds</h4></CardHeader>
          <CardContent>
            <DataPoint label="Max Probability of Default (PD Max)" value={`${(config.pdMax * 100).toFixed(1)}%`} />
            <DataPoint label='"Accept" if PD is ≤' value={`${(config.decisionThresholds.acceptPd * 100).toFixed(1)}%`} />
            <DataPoint label='"Conditional" if PD is ≤' value={`${(config.decisionThresholds.conditionalPd * 100).toFixed(1)}%`} />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
