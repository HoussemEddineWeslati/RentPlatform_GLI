// src/database/schema.ts

import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users table (UPDATED)
 * Checklist 1: Store OTPs in DB instead of session.
 * - otpHash: Hashed OTP for security.
 * - otpExpires: Expiration timestamp for the OTP.
 * - otpAttempts: Track failed verification attempts for rate limiting.
 * - lastOtpSentAt: Track timestamp to enforce resend cooldown.
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  companyName: varchar("company_name"),
  isVerified: boolean("is_verified").default(false).notNull(),

  // Password Reset Fields
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires",{ withTimezone: true }),

  // NEW: OTP & Email Verification Fields
  otpHash: varchar("otp_hash"),
  otpExpires: timestamp("otp_expires",{ withTimezone: true }),
  otpAttempts: integer("otp_attempts").default(0).notNull(),
  lastOtpSentAt: timestamp("last_otp_sent_at",{ withTimezone: true }),

  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
});

export const landlords = pgTable("landlords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Added onDelete cascade
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  propertyCount: integer("property_count").notNull().default(0),
  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at",{ withTimezone: true }).defaultNow(),
});
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  landlordId: varchar("landlord_id")
    .notNull()
    .references(() => landlords.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull().default("Unknown"),
  rentAmount: decimal("rent_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  type: varchar("type").notNull(), // apartment, house, studio
  status: varchar("status").notNull().default("available"), // available, rented, maintenance
  maxTenants: integer("max_tenants").notNull().default(1),
  currentTenants: integer("current_tenants").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
  
updatedAt: timestamp("updated_at",{ withTimezone: true }).defaultNow(),
});
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: varchar("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // paid, pending, overdue
  leaseStart: timestamp("lease_start",{ withTimezone: true }).notNull(),
  leaseEnd: timestamp("lease_end",{ withTimezone: true }).notNull(),
  lastPaymentDate: timestamp("last_payment_date",{ withTimezone: true }),
  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
});
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }).notNull(),
  riskFactor: varchar("risk_factor").notNull(), // low, medium, high
  coverageLevel: varchar("coverage_level").notNull(), // basic, standard, premium
  monthlyPremium: decimal("monthly_premium", {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
});
export const scoringConfigs = pgTable("scoring_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  configJson: text("config_json").notNull(),
  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at",{ withTimezone: true }).defaultNow(),
});

/**
 * NEW: Policies table
 */
export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  landlordId: varchar("landlord_id").notNull().references(() => landlords.id, { onDelete: "cascade" }),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }).unique(),
  policyNumber: varchar("policy_number").notNull().unique(),
  status: varchar("status").notNull().default("active"), // active, expired, cancelled
  coverageMonths: integer("coverage_months").notNull(),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(),
  decision: varchar("decision").notNull(), // accept, conditional_accept, decline
  startDate: timestamp("start_date",{ withTimezone: true }).notNull(),
  endDate: timestamp("end_date",{ withTimezone: true }).notNull(),
  premiumAmount: decimal("premium_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at",{ withTimezone: true }).defaultNow(),
});

/**
 * NEW: Claims table
 */
export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  policyId: varchar("policy_id").notNull().references(() => policies.id, { onDelete: "cascade" }),
  claimNumber: varchar("claim_number").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected, paid
  amountRequested: decimal("amount_requested", { precision: 10, scale: 2 }).notNull(),
  monthsOfUnpaidRent: integer("months_of_unpaid_rent").notNull().default(0),
  evidenceLinks: jsonb("evidence_links").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at",{ withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at",{ withTimezone: true }).defaultNow(),
});

export const evidenceFiles = pgTable("evidence_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id")
    .notNull()
    .references(() => claims.id, { onDelete: "cascade" }),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  size: integer("size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  path: varchar("path").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
});

/**
 * Insert schemas
 */
export const insertUserSchema = createInsertSchema(users, {
  companyName: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
  // Omit new OTP fields from the insert schema
  otpHash: true,
  otpExpires: true,
  otpAttempts: true,
  lastOtpSentAt: true,
});

export const insertLandlordSchema = createInsertSchema(landlords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  propertyCount: true,
});

export const insertPropertySchema = createInsertSchema(properties)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    rentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
    status: z.enum(["available", "rented", "maintenance"]),
    maxTenants: z.coerce.number().int().min(1).default(1),
    currentTenants: z.coerce.number().int().min(0).default(0),
  });

export const insertTenantSchema = createInsertSchema(tenants)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    leaseStart: z.coerce.date(),
    leaseEnd: z.coerce.date(),
    lastPaymentDate: z.coerce.date().optional(),
    rentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  });

export const insertQuoteSchema = createInsertSchema(quotes)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    rentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
    monthlyPremium: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  });

export const insertScoringConfigSchema = createInsertSchema(scoringConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPolicySchema = createInsertSchema(policies, {
    status: z.enum(["active", "expired", "cancelled"]).default("active"),
    riskScore: z.number(),
    premiumAmount: z.number(),
}).omit({ id: true, policyNumber: true, createdAt: true, updatedAt: true }).extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});
export const insertClaimSchema = createInsertSchema(claims, {
    status: z.enum(["pending", "approved", "rejected", "paid"]).default("pending"),
    amountRequested: z.number(),
    evidenceLinks: z.array(z.string().url()).optional(),
}).omit({ id: true, claimNumber: true, createdAt: true, updatedAt: true });
/**
 * Login and other specific schemas
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Export types
 */
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Landlord = typeof landlords.$inferSelect;
export type InsertLandlord = z.infer<typeof insertLandlordSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ScoringConfig = typeof scoringConfigs.$inferSelect;
export type InsertScoringConfig = z.infer<typeof insertScoringConfigSchema>;

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type EvidenceFile = typeof evidenceFiles.$inferSelect;
