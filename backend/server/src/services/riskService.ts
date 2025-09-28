// src/services/riskService.ts
import type { RiskRequest } from "../validators/riskSchema";

/**
 * Rule-based scoring implementation.
 * Returns component breakdown, SafetyScore (0-100), PD_12m, decision, and explanation.
 *
 * We use the scoring table agreed earlier:
 * Personal Info (10), Employment & Income (25), Financial Obligations (20),
 * Housing & Rental History (25), Other Factors (20)  => total 100.
 */

type ComponentScores = {
  personal: number;
  employment: number;
  financial: number;
  housing: number;
  other: number;
  breakdown: Record<string, number>;
};

export function computeComponentScores(input: RiskRequest): ComponentScores {
  const breakdown: Record<string, number> = {};

  // --- Personal (10 points)
  let personal = 0;
  // Age
  const age = input.age ?? 0;
  if (age >= 21 && age <= 60) personal += 5;
  else if (age > 60 || (age > 0 && age < 21)) personal += 2;
  // Marital status
  if (input.maritalStatus === "Married") personal += 3;
  else if (input.maritalStatus === "Single") personal += 2;
  else if (input.maritalStatus === "Divorced" || input.maritalStatus === "Widowed") personal += 1;
  // Dependents
  const deps = input.numberOfDependents ?? 0;
  if (deps <= 2) personal += 2;
  else if (deps <= 4) personal += 1;
  // clamp
  personal = Math.max(0, Math.min(10, personal));
  breakdown["personal"] = personal; // ✅ FIXED: Use the correct key "personal"

  // --- Employment & Income (25 points)
  let employment = 0;
  // Employment type
  const et = input.employmentType;
  if (et === "Permanent") employment += 10;
  else if (et === "Contract") employment += 7;
  else if (et === "Self_employed") employment += 5;
  else if (et === "Student") employment += 2;
  else if (et === "Unemployed") employment += 0;
  else if (et === "Retired") employment += 4;

  // Salary relative to rent (if both present)
  const salary = input.monthlyNetSalary ?? 0;
  const rent = input.rentAmount ?? 0;
  if (salary > 0 && rent > 0) {
    const ratio = rent / salary;
    if (ratio <= 0.30) employment += 10;
    else if (ratio <= 0.50) employment += 5;
    else employment += 0;
  } else {
    // if salary or rent missing, be conservative and give partial points
    employment += 5;
  }

  // Employment stability
  const yrs = input.employmentYears ?? 0;
  if (yrs >= 5) employment += 5;
  else if (yrs >= 2) employment += 3;
  else employment += 1;

  employment = Math.max(0, Math.min(25, employment));
  breakdown["employment"] = employment; // ✅ FIXED: This one was already correct

  // --- Financial Obligations (20 pts)
  let financial = 0;
  const monthlyDebt = input.monthlyDebtPayments ?? 0;
  const otherObl = input.otherObligations ?? 0;
  const dti = (salary > 0) ? ( (monthlyDebt + otherObl) / salary ) : 1.0;

  if (dti < 0.20) financial += 7;
  else if (dti <= 0.40) financial += 4;
  else financial += 0;

  // Savings
  const savings = input.savingsBalance ?? 0;
  const monthsOfRent = (rent > 0) ? savings / rent : 0;
  if (monthsOfRent >= 6) financial += 8;
  else if (monthsOfRent >= 3) financial += 4;
  else financial += 0;

  // Other obligations scoring (relative to income)
  const otherRatio = (salary > 0) ? (otherObl / salary) : 1.0;
  if (otherRatio < 0.10) financial += 5;
  else if (otherRatio <= 0.20) financial += 3;
  else financial += 0;

  financial = Math.max(0, Math.min(20, financial));
  breakdown["financial"] = financial; // ✅ FIXED: This one was already correct

  // --- Housing & Rental History (25 pts)
  let housing = 0;
  // tenure
  const monthsResidence = input.monthsAtResidence ?? 0;
  if (monthsResidence >= 36) housing += 5;
  else if (monthsResidence >= 12) housing += 3;
  else housing += 1;
  // guarantor
  if (input.hasGuarantor) housing += 5;
  // guarantor location
  if (input.hasGuarantor) {
    if (input.guarantorLocation === "Tunisia") housing += 3;
    else if (input.guarantorLocation === "Outside") housing += 1;
  }
  // past defaults
  const defaults = input.numberOfPastDefaults ?? 0;
  if (defaults === 0) housing += 7;
  else if (defaults <= 2) housing += 3;
  else housing += 0;
  // landlord references
  const refs = input.landlordReferences ?? [];
  // score based on best reference rating
  let bestRefScore = 0;
  for (const r of refs) {
    if (r.rating === "Positive") bestRefScore = Math.max(bestRefScore, 5);
    else if (r.rating === "Neutral") bestRefScore = Math.max(bestRefScore, 2);
    else if (r.rating === "Negative") bestRefScore = Math.max(bestRefScore, 0);
  }
  housing += bestRefScore;

  housing = Math.max(0, Math.min(25, housing));
  breakdown["housing"] = housing; // ✅ FIXED: This one was already correct

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

  other = Math.max(0, Math.min(20, other));
  breakdown["other"] = other; // ✅ FIXED: This one was already correct

  return {
    personal,
    employment,
    financial,
    housing,
    other,
    breakdown,
  };
}

export function computeSafetyScoreAndPd(input: RiskRequest, pdMax = 0.25) {
  const comps = computeComponentScores(input);

  // Total SafetyScore (0..100)
  const safetyScore = comps.personal + comps.employment + comps.financial + comps.housing + comps.other;

  // PD linear mapping
  const PD_12m = pdMax * (1 - (safetyScore / 100));

  // Decision bands
  let decision: "accept" | "conditional_accept" | "decline" = "decline";
  if (PD_12m <= 0.03) decision = "accept";
  else if (PD_12m <= 0.10) decision = "conditional_accept";
  else decision = "decline";

  // Short explanation
  const explanations: string[] = [];
  if (comps.housing < 10) explanations.push("Weak housing history or missing guarantor.");
  if (comps.employment < 10) explanations.push("Employment not stable or low income.");
  if (comps.financial < 8) explanations.push("High debt or low savings.");
  if (comps.other < 6) explanations.push("Utility payments or verification missing.");
  if (explanations.length === 0) explanations.push("Applicant meets primary underwriting criteria.");

  return {
    safetyScore: Math.round(safetyScore * 100) / 100,
    PD_12m: Math.round(PD_12m * 10000) / 10000,
    decision,
    components: comps.breakdown,
    explanations,
  };
}