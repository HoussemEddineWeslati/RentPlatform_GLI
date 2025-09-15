// client/src/types/risk.ts
export type GuarantorLocation = "Tunisia" | "Outside" | "Unknown";
export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed";
export type EmploymentType = "Permanent" | "Contract" | "Self_employed" | "Student" | "Unemployed" | "Retired";
export type UtilityPaymentHistory = "Always" | "Sometimes" | "Frequently";
export type HealthStatus = "Good" | "Average" | "Poor";

export type LandlordReference = {
  id?: string;
  name?: string;
  phone?: string;
  relation?: string;
  rating?: "Positive" | "Neutral" | "Negative";
};

export type RiskRequest = {
  fullName?: string;
  age?: number;
  maritalStatus?: MaritalStatus;
  numberOfDependents?: number;

  employmentType?: EmploymentType;
  monthlyNetSalary?: number;
  employmentYears?: number;

  monthlyDebtPayments?: number;
  savingsBalance?: number;
  otherObligations?: number;

  rentAmount?: number;
  hasGuarantor?: boolean;
  guarantorIncome?: number | null;
  guarantorLocation?: GuarantorLocation;
  monthsAtResidence?: number;
  numberOfPastDefaults?: number;
  landlordReferences?: LandlordReference[];

  utilityPaymentHistory?: UtilityPaymentHistory;
  healthStatus?: HealthStatus;
  verifiedId?: boolean;
  nationalId?: string | undefined;
};

export type RiskResponse = {
  safetyScore: number;
  PD_12m: number;
  decision: "accept" | "conditional_accept" | "decline";
  components: Record<string, number>;
  explanations: string[];
};

export type ApiRiskResponse = {
  success: true;
  risk: RiskResponse;
};
