// client/src/types/schema/claimSchema.ts
import { z } from "zod";

export const insertClaimSchema = z.object({
  id: z.string().uuid().optional(),
  policyId: z.string().uuid("Policy is required"),
  claimNumber: z.string().optional(),
  status: z.enum(["pending", "under_review", "approved", "rejected", "paid"]).default("pending"),
  amountRequested: z.coerce.number().positive("Amount must be positive"),
  monthsOfUnpaidRent: z.coerce.number().int().min(0, "Must be 0 or more").default(0),
  evidenceLinks: z.array(z.string().url("Invalid URL")).optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Claim = z.infer<typeof insertClaimSchema> & {
  policyNumber?: string;
  landlordName?: string;
  tenantName?: string;
};

// ✅ EXPORT THIS TYPE
export type ClaimListItem = {
  id: string;
  claimNumber: string;
  status: string;
  amountRequested: string;
  policyNumber: string;
  landlordName: string;
};

// ✅ EXPORT THIS TYPE
export type ClaimDetail = {
  claim: {
    id: string;
    userId: string;
    policyId: string;
    claimNumber: string;
    status: string;
    amountRequested: string;
    monthsOfUnpaidRent: number;
    evidenceLinks: string[] | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  policy: {
    id: string;
    policyNumber: string;
    status: string;
    startDate: Date;
    endDate: Date;
    premiumAmount: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    rentAmount: string;
  };
};

// ✅ EXPORT THIS TYPE
export interface ClaimsApiResponse {
  success: boolean;
  data: ClaimListItem[];
}

// ✅ EXPORT THIS TYPE
export interface ClaimDetailApiResponse {
  success: boolean;
  data: ClaimDetail;
}