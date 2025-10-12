// src/types/schema/configSchema.ts
import { z } from "zod";

export const weightsSchema = z.object({
  personal: z.coerce.number().min(0, "Must be non-negative"),
  employment: z.coerce.number().min(0, "Must be non-negative"),
  financial: z.coerce.number().min(0, "Must be non-negative"),
  housing: z.coerce.number().min(0, "Must be non-negative"),
  other: z.coerce.number().min(0, "Must be non-negative"),
});

export const decisionThresholdsSchema = z.object({
  acceptPd: z.coerce
    .number()
    .min(0, "Must be non-negative")
    .max(1, "Must be less than or equal to 1"),
  conditionalPd: z.coerce
    .number()
    .min(0, "Must be non-negative")
    .max(1, "Must be less than or equal to 1"),
});

export const scoringConfigFormSchema = z.object({
  name: z.string().optional(),
  weights: weightsSchema,
  pdMax: z.coerce
    .number()
    .min(0, "Must be non-negative")
    .max(1, "Must be less than or equal to 1"),
  decisionThresholds: decisionThresholdsSchema,
}).refine(data => {
    // Ensure the sum of weights is a positive number for normalization
    const totalWeight = Object.values(data.weights).reduce((sum, w) => sum + w, 0);
    return totalWeight > 0;
}, {
    message: "The sum of all weights must be greater than zero.",
    path: ["weights.personal"], // Assign the error message to the first weight field for display
});

export type ScoringConfigFormData = z.infer<typeof scoringConfigFormSchema>;