// src/pages/settings/ConfigForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConfig } from "@/hooks/use-config";
import { scoringConfigFormSchema, type ScoringConfigFormData } from "@/types/schema/configSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface ConfigFormProps {
  onFinished: () => void;
}

export function ConfigForm({ onFinished }: ConfigFormProps) {
  const { config, isLoading, updateConfig, isUpdating } = useConfig();

  const form = useForm<ScoringConfigFormData>({
    resolver: zodResolver(scoringConfigFormSchema),
    defaultValues: {
      name: "",
      weights: { personal: 10, employment: 25, financial: 20, housing: 25, other: 20 },
      pdMax: 0.25,
      decisionThresholds: { acceptPd: 0.03, conditionalPd: 0.10 },
    },
  });

  useEffect(() => {
    if (config) {
      form.reset(config);
    }
  }, [config, form]);

  const onSubmit = (data: ScoringConfigFormData) => {
    updateConfig(data, {
      onSuccess: onFinished,
    });
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading Form...</CardTitle>
                <CardDescription>Fetching current settings to populate the form.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const renderError = (fieldError: any) =>
    fieldError ? <p className="text-sm text-destructive mt-1">{fieldError.message}</p> : null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Update Credit Scoring Configuration</CardTitle>
          <CardDescription>
            Adjust the weights and thresholds. Changes will apply to all future tenant screenings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="name">Model Name (Optional)</Label>
            <Input id="name" placeholder="e.g., Aggressive Growth Model" {...form.register("name")} />
          </div>
          <div>
            <Label>Component Weights</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Assign points to each category. The total must be greater than zero.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 border rounded-lg">
              {Object.keys(form.getValues("weights")).map((key) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`weights.${key}`} className="capitalize">{key}</Label>
                  <Input id={`weights.${key}`} type="number" step="1" {...form.register(`weights.${key as keyof ScoringConfigFormData['weights']}`)} />
                  {renderError(form.formState.errors.weights?.[key as keyof ScoringConfigFormData['weights']])}
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Thresholds</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Define the Probability of Default (PD) boundaries. Values must be between 0 and 1.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="pdMax">Max PD</Label>
                <Input id="pdMax" type="number" step="0.01" {...form.register("pdMax")} />
                {renderError(form.formState.errors.pdMax)}
              </div>
              <div className="space-y-2">
                <Label htmlFor="decisionThresholds.acceptPd">"Accept" if PD ≤</Label>
                <Input id="decisionThresholds.acceptPd" type="number" step="0.01" {...form.register("decisionThresholds.acceptPd")} />
                {renderError(form.formState.errors.decisionThresholds?.acceptPd)}
              </div>
              <div className="space-y-2">
                <Label htmlFor="decisionThresholds.conditionalPd">"Conditional" if PD ≤</Label>
                <Input id="decisionThresholds.conditionalPd" type="number" step="0.01" {...form.register("decisionThresholds.conditionalPd")} />
                {renderError(form.formState.errors.decisionThresholds?.conditionalPd)}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onFinished}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
