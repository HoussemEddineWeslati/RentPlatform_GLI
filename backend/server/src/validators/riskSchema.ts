// src/validators/riskSchema.ts

import { z } from "zod";

/**
 * Input schema for risk calculation (all fields optional for flexibility,
 * but required ones validated in controller).
 */
export const riskRequestSchema = z.object({
  // Personal info
  fullName: z.string().optional(),
  age: z.number().int().min(18).max(120).optional(),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]).optional(),
  numberOfDependents: z.number().int().min(0).optional(),

  // Employment & income
  employmentType: z.enum([
    "Permanent",
    "Contract",
    "Self_employed",
    "Student",
    "Unemployed",
    "Retired",
  ]).optional(),
  monthlyNetSalary: z.number().nonnegative().optional(),
  employmentYears: z.number().int().min(0).optional(),

  // Financial obligations
  monthlyDebtPayments: z.number().nonnegative().optional().default(0),
  savingsBalance: z.number().nonnegative().optional().default(0),
  otherObligations: z.number().nonnegative().optional().default(0),

  // Housing & rental history
  rentAmount: z.number().nonnegative().optional(),
  hasGuarantor: z.boolean().optional().default(false),
  guarantorIncome: z.number().nonnegative().optional().nullable(),
  guarantorLocation: z.enum(["Tunisia", "Outside", "Unknown"]).optional().default("Unknown"),
  monthsAtResidence: z.number().int().min(0).optional().default(0),
 
  numberOfPastDefaults: z.number().int().min(0).optional().default(0),
  // landlordRefs: array of {name, phone, relation, rating}
  landlordReferences: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
    rating: z.enum(["Positive","Neutral","Negative"]).optional().default("Neutral"),
  })).optional().default([]),

  // Other
  utilityPaymentHistory: z.enum(["Always", "Sometimes", "Frequently"]).optional().default("Sometimes"),
  healthStatus: z.enum(["Good", "Average", "Poor"]).optional().default("Good"),
  verifiedId: z.boolean().optional().default(false),
});


/**
 * NEW: Schema for generating the full PDF report.
 * Extends the base risk schema with additional details needed for the document.
 */
export const riskReportRequestSchema = riskRequestSchema.extend({
    tenantEmail: z.string().email().optional(),
    tenantPhone: z.string().optional(),
    propertyAddress: z.string().optional(),
    propertyCity: z.string().optional(),
    propertyType: z.string().optional(),
    propertyStatus: z.string().optional(),
    leaseStartDate: z.coerce.date().optional(),
    leaseEndDate: z.coerce.date().optional(),
});


export type RiskRequest = z.infer<typeof riskRequestSchema>;
export type RiskReportRequest = z.infer<typeof riskReportRequestSchema>;