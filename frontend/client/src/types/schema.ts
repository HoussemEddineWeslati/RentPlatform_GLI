// Types
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
};
import { z } from "zod";
// =================================================================================
// USER SCHEMA
// =================================================================================
export const insertUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// =================================================================================
// LANDLORD SCHEMA
// =================================================================================
export const insertLandlordSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  userId: z.string().uuid(),
  propertyCount: z.number().int().optional().default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Landlord = z.infer<typeof insertLandlordSchema>;

// =================================================================================
// PROPERTY SCHEMA
// =================================================================================
export const insertPropertySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Property name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  rentAmount: z.coerce.number().positive("Rent must be a positive number"),
  type: z.enum(["villa", "apartment", "house", "studio"]),
  status: z.enum(["available", "rented", "under_maintenance"]),
  maxTenants: z.coerce.number().int().min(1, "Must allow at least one tenant"),
  description: z.string().optional(),
  landlordId: z.string().uuid("A landlord must be selected"),
  assignedTenants: z.number().int().optional().default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Property = z.infer<typeof insertPropertySchema>;

// =================================================================================
// TENANT SCHEMA
// =================================================================================
export const insertTenantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email format"),
  rentAmount: z.coerce.number().positive("Rent must be a positive number"),
  paymentStatus: z.enum(["paid", "pending", "overdue"]),
  leaseStart: z.string().datetime("Invalid lease start date"),
  leaseEnd: z.string().datetime("Invalid lease end date"),
  propertyId: z.string().uuid("A property must be selected"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Tenant = z.infer<typeof insertTenantSchema>;

// Quote schemas and types
export const insertQuoteSchema = z.object({
  userId: z.string(),
  rentAmount: z.string(),
  riskFactor: z.string(),
  coverageLevel: z.string(),
  monthlyPremium: z.string(),
});

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