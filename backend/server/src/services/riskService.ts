// src/services/riskService.ts 
import type { RiskRequest } from "../validators/riskSchema";
import { scoringConfigSchema, type ScoringConfig } from "../validators/configSchema";

/**
 * Original component maxes (what the hard-coded logic originally assumed).
 * We use these to normalize raw component scores before re-scaling to configured weights.
 */
const ORIGINAL_MAX = {
  personal: 10,
  employment: 25,
  financial: 20,
  housing: 25,
  other: 20,
};

/**
 * computeComponentScores(input) -> original component scores (0..original max).
 * This function keeps the original scoring logic you already had.
 */
export function computeComponentScores(input: RiskRequest) {
  const breakdown: Record<string, number> = {};
  // --- Personal (10 points)
  let personal = 0;
  const age = input.age ?? 0;
  if (age >= 21 && age <= 60) personal += 5;
  else if (age > 60 || (age > 0 && age < 21)) personal += 2;
  if (input.maritalStatus === "Married") personal += 3;
  else if (input.maritalStatus === "Single") personal += 2;
  else if (input.maritalStatus === "Divorced" || input.maritalStatus === "Widowed") personal += 1;
  const deps = input.numberOfDependents ?? 0;
  if (deps <= 2) personal += 2;
  else if (deps <= 4) personal += 1;
  personal = Math.max(0, Math.min(ORIGINAL_MAX.personal, personal));
  breakdown["personal"] = personal;
  // --- Employment & Income (25 points)
  let employment = 0;
  const et = input.employmentType;
  if (et === "Permanent") employment += 10;
  else if (et === "Contract") employment += 7;
  else if (et === "Self_employed") employment += 5;
  else if (et === "Student") employment += 2;
  else if (et === "Unemployed") employment += 0;
  else if (et === "Retired") employment += 4;
  const salary = input.monthlyNetSalary ?? 0;
  const rent = input.rentAmount ?? 0;
  if (salary > 0 && rent > 0) {
    const ratio = rent / salary;
    if (ratio <= 0.30) employment += 10;
    else if (ratio <= 0.50) employment += 5;
    else employment += 0;
  } else {
    employment += 5;
  }
  const yrs = input.employmentYears ?? 0;
  if (yrs >= 5) employment += 5;
  else if (yrs >= 2) employment += 3;
  else employment += 1;
  employment = Math.max(0, Math.min(ORIGINAL_MAX.employment, employment));
  breakdown["employment"] = employment;
  // --- Financial Obligations (20 pts)
  let financial = 0;
  const monthlyDebt = input.monthlyDebtPayments ?? 0;
  const otherObl = input.otherObligations ?? 0;
  const dti = (salary > 0) ? ((monthlyDebt + otherObl) / salary) : 1.0;
  if (dti < 0.20) financial += 7;
  else if (dti <= 0.40) financial += 4;
  else financial += 0;
  const savings = input.savingsBalance ?? 0;
  const monthsOfRent = (rent > 0) ? savings / rent : 0;
  if (monthsOfRent >= 6) financial += 8;
  else if (monthsOfRent >= 3) financial += 4;
  else financial += 0;
  const otherRatio = (salary > 0) ? (otherObl / salary) : 1.0;
  if (otherRatio < 0.10) financial += 5;
  else if (otherRatio <= 0.20) financial += 3;
  else financial += 0;
  financial = Math.max(0, Math.min(ORIGINAL_MAX.financial, financial));
  breakdown["financial"] = financial;
  // --- Housing & Rental History (25 pts)
  let housing = 0;
  const monthsResidence = input.monthsAtResidence ?? 0;
  if (monthsResidence >= 36) housing += 5;
  else if (monthsResidence >= 12) housing += 3;
  else housing += 1;
  if (input.hasGuarantor) housing += 5;
  if (input.hasGuarantor) {
    if (input.guarantorLocation === "Tunisia") housing += 3;
    else if (input.guarantorLocation === "Outside") housing += 1;
  }
  const defaults = input.numberOfPastDefaults ?? 0;
  if (defaults === 0) housing += 7;
  else if (defaults <= 2) housing += 3;
  else housing += 0;
  const refs = input.landlordReferences ?? [];
  let bestRefScore = 0;
  for (const r of refs) {
    if (r.rating === "Positive") bestRefScore = Math.max(bestRefScore, 5);
    else if (r.rating === "Neutral") bestRefScore = Math.max(bestRefScore, 2);
    else if (r.rating === "Negative") bestRefScore = Math.max(bestRefScore, 0);
  }
  housing += bestRefScore;
  housing = Math.max(0, Math.min(ORIGINAL_MAX.housing, housing));
  breakdown["housing"] = housing;
  // --- Other factors (20 pts)
  let other = 0;
  const utility = input.utilityPaymentHistory;
  if (utility === "Always") other += 10;
  else if (utility === "Sometimes") other += 5;
  else other += 0;
  const health = input.healthStatus;
  if (health === "Good") other += 5;
  else if (health === "Average") other += 3;
  else other += 0;
  if (input.verifiedId) other += 5;
  other = Math.max(0, Math.min(ORIGINAL_MAX.other, other));
  breakdown["other"] = other;
  return {
    personal,
    employment,
    financial,
    housing,
    other,
    breakdown,
  };
}

/**
 * REFACTORED: computeSafetyScoreAndPd
 * - The `DEFAULT_SCORING_CONFIG` is removed as it's no longer necessary.
 * - We now parse the `scoringConfig` (or an empty object) directly. The updated schema
 * guarantees that `config.weights` and `config.decisionThresholds` will be fully-formed objects.
 * - All defensive nullish coalescing operators (??) have been removed for cleaner, more direct code.
 */
export function computeSafetyScoreAndPd(
  input: RiskRequest,
  pdMax = 0.25, // Note: This is now superseded by the `pdMax` in the scoring config.
  scoringConfig?: Partial<ScoringConfig>
) {
  // Zod now handles all default values, including for nested objects, thanks to the schema change.
  const config = scoringConfigSchema.parse(scoringConfig || {});
  const { weights, decisionThresholds } = config;

  const comps = computeComponentScores(input);

  // For each component: normalized = comps.X / ORIGINAL_MAX.X (0..1)
  // scaled = normalized * config.weights.X (which are the new maxima)
  const personalScaled = (comps.personal / ORIGINAL_MAX.personal) * weights.personal;
  const employmentScaled = (comps.employment / ORIGINAL_MAX.employment) * weights.employment;
  const financialScaled = (comps.financial / ORIGINAL_MAX.financial) * weights.financial;
  const housingScaled = (comps.housing / ORIGINAL_MAX.housing) * weights.housing;
  const otherScaled = (comps.other / ORIGINAL_MAX.other) * weights.other;

  const scaled = {
      personal: Math.round(personalScaled * 100) / 100,
      employment: Math.round(employmentScaled * 100) / 100,
      financial: Math.round(financialScaled * 100) / 100,
      housing: Math.round(housingScaled * 100) / 100,
      other: Math.round(otherScaled * 100) / 100,
  };

  // Sum scaled components to get total safetyScore
  const totalWeight = weights.personal + weights.employment + weights.financial + weights.housing + weights.other;
  const rawSum = scaled.personal + scaled.employment + scaled.financial + scaled.housing + scaled.other;

  // Map to 0..100 for readability
  const safetyScore = totalWeight > 0 ? Math.round((rawSum / totalWeight) * 10000) / 100 : 0;

  // PD uses configured pdMax, which now has a reliable default from the schema.
  const PD_12m = Math.round((config.pdMax * (1 - safetyScore / 100)) * 10000) / 10000;

  // Decision logic is now cleaner as `decisionThresholds` is guaranteed to exist.
  let decision: "accept" | "conditional_accept" | "decline" = "decline";
  if (PD_12m <= decisionThresholds.acceptPd) {
    decision = "accept";
  } else if (PD_12m <= decisionThresholds.conditionalPd) {
    decision = "conditional_accept";
  }

  // Explanation heuristics are also cleaner.
  const explanations: string[] = [];
  if ((scaled.housing / weights.housing) * 100 < 40) explanations.push("Weak housing history or missing guarantor.");
  if ((scaled.employment / weights.employment) * 100 < 40) explanations.push("Employment not stable or low income.");
  if ((scaled.financial / weights.financial) * 100 < 40) explanations.push("High debt or low savings.");
  if ((scaled.other / weights.other) * 100 < 30) explanations.push("Utility payments or verification missing.");
  if (explanations.length === 0) explanations.push("Applicant meets primary underwriting criteria.");

  return {
    safetyScore: Math.round(safetyScore * 100) / 100,
    PD_12m,
    decision,
    components: scaled,
    explanations,
  };
}
