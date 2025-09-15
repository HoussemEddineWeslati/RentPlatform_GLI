import { z } from "zod";

// User schemas and types
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Property schemas and types
export const insertPropertySchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  address: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
});

// Tenant schemas and types
export const insertTenantSchema = z.object({
  userId: z.string(),
  propertyId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  rentAmount: z.string(),
  paymentStatus: z.string().default("pending"),
  leaseStart: z.string(),
  leaseEnd: z.string(),
  lastPaymentDate: z.string().optional(),
});

// Quote schemas and types
export const insertQuoteSchema = z.object({
  userId: z.string(),
  rentAmount: z.string(),
  riskFactor: z.string(),
  coverageLevel: z.string(),
  monthlyPremium: z.string(),
});

// Types
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Property = {
  id: string;
  userId: string;
  name: string;
  address: string;
  type: string;
  description?: string;
  createdAt?: Date;
};

export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Tenant = {
  id: string;
  userId: string;
  propertyId: string;
  name: string;
  email: string;
  rentAmount: string;
  paymentStatus: string;
  leaseStart: Date;
  leaseEnd: Date;
  lastPaymentDate?: Date;
  createdAt?: Date;
};

export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type Quote = {
  id: string;
  userId: string;
  rentAmount: string;
  riskFactor: string;
  coverageLevel: string;
  monthlyPremium: string;
  createdAt?: Date;
};

export type InsertQuote = z.infer<typeof insertQuoteSchema>;