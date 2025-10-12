// src/validators/configSchema.ts
import { z } from "zod";

/**
 * ScoringConfig shape:
 * - weights: how many points (total) allocated to each component (must sum to >0 ideally)
 * - pdMax: PD scaling upper bound (e.g. 0.25)
 * - decisionThresholds: numeric PD thresholds for accept / conditional / decline
 *
 * Note: weights are absolute top-scores for each component (e.g. personal:10, employment:25 ...).
 */
export const weightsSchema = z.object({
  personal: z.number().nonnegative().optional().default(10),
  employment: z.number().nonnegative().optional().default(25),
  financial: z.number().nonnegative().optional().default(20),
  housing: z.number().nonnegative().optional().default(25),
  other: z.number().nonnegative().optional().default(20),
});

export const decisionThresholdsSchema = z.object({
  acceptPd: z.number().nonnegative().optional().default(0.03), // PD <= 0.03 -> accept
  conditionalPd: z.number().nonnegative().optional().default(0.10), // PD <= 0.10 -> conditional
  // decline: PD > conditionalPd
});

export const scoringConfigSchema = z.object({
  // FIX: Added .default({}) to ensure the 'weights' object is always present.
  // Zod will parse it against weightsSchema, which applies the defaults for each property.
  weights: weightsSchema.optional().default({}),

  pdMax: z.number().positive().optional().default(0.25),

  // FIX: Added .default({}) to ensure the 'decisionThresholds' object is always present.
  decisionThresholds: decisionThresholdsSchema.optional().default({}),

  // optional descriptive name
  name: z.string().max(200).optional(),
});

export type ScoringConfig = z.infer<typeof scoringConfigSchema>;
