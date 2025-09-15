// client/src/types/schema/riskSchema.ts
import { z } from "zod";

export const riskFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.number().int().min(18, "Age must be at least 18").max(99, "Age must be <= 99"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  numberOfDependents: z.number().int().min(0).max(10),

  employmentType: z.enum(["Permanent", "Contract", "Self_employed", "Student", "Unemployed", "Retired"]),
  monthlyNetSalary: z.number().nonnegative(),
  employmentYears: z.number().int().min(0),

  monthlyDebtPayments: z.number().nonnegative(),
  savingsBalance: z.number().nonnegative(),
  otherObligations: z.number().nonnegative(),

  rentAmount: z.number().nonnegative(),
  hasGuarantor: z.boolean(),
  guarantorIncome: z.number().nonnegative().nullable().optional(),
  guarantorLocation: z.enum(["Tunisia", "Outside", "Unknown"]).optional(),
  monthsAtResidence: z.number().int().min(0).optional(),
  numberOfPastDefaults: z.number().int().min(0).optional(),
  landlordReferences: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
    rating: z.enum(["Positive", "Neutral", "Negative"]).optional(),
  })).optional(),

  utilityPaymentHistory: z.enum(["Always", "Sometimes", "Frequently"]).optional(),
  healthStatus: z.enum(["Good", "Average", "Poor"]).optional(),
  verifiedId: z.boolean().optional(),
  nationalId: z.string().optional(),
});

export type RiskFormData = z.infer<typeof riskFormSchema>;
