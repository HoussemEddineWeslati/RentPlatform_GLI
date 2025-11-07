// client/src/types/schema/policySchema.ts
import { z } from "zod";

export const insertPolicySchema = z.object({
  id: z.string().uuid().optional(),
  landlordId: z.string().uuid("Landlord is required"),
  propertyId: z.string().uuid("Property is required"),
  tenantId: z.string().uuid("Tenant is required"),
  policyNumber: z.string().optional(),
  status: z.enum(["active", "expired", "cancelled"]).default("active"),
  coverageMonths: z.coerce.number().int().min(1, "Coverage must be at least 1 month"),
  riskScore: z.coerce.number().min(0).max(100, "Risk score must be between 0 and 100"),
  decision: z.enum(["accept", "conditional_accept", "decline"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  premiumAmount: z.coerce.number().positive("Premium amount must be positive"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Policy = z.infer<typeof insertPolicySchema> & {
  tenantName?: string;
  landlordName?: string;
  propertyName?: string;
};

export type PolicyDetail = {
  policy: {
    id: string;
    userId: string;
    landlordId: string;
    propertyId: string;
    tenantId: string;
    policyNumber: string;
    status: string;
    coverageMonths: number;
    riskScore: string;
    decision: string;
    startDate: Date;
    endDate: Date;
    premiumAmount: string;
    createdAt: Date;
    updatedAt: Date;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    rentAmount: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    type: string;
  };
  landlord: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};