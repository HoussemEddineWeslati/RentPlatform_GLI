import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users table (unchanged)
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * New: Landlords table
 * Each landlord belongs to a user (the insurer) via userId
 */
export const landlords = pgTable("landlords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  propertyCount: integer("property_count").notNull().default(0), // <-- add this line
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Properties table — updated to include landlordId, city, rentAmount, status
 * We keep userId for backwards compatibility (insurer scope)
 */
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  landlordId: varchar("landlord_id").notNull().references(() => landlords.id),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull().default("Unknown"),
  rentAmount: decimal("rent_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  type: varchar("type").notNull(), // apartment, house, studio
  status: varchar("status").notNull().default("available"), // available, rented, maintenance
  maxTenants: integer("max_tenants").notNull().default(1),
  currentTenants: integer("current_tenants").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Tenants table (unchanged fields) — references property
 */
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // paid, pending, overdue
  leaseStart: timestamp("lease_start").notNull(),
  leaseEnd: timestamp("lease_end").notNull(),
  lastPaymentDate: timestamp("last_payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Quotes (unchanged)
 */
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }).notNull(),
  riskFactor: varchar("risk_factor").notNull(), // low, medium, high
  coverageLevel: varchar("coverage_level").notNull(), // basic, standard, premium
  monthlyPremium: decimal("monthly_premium", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Insert schemas (zod + drizzle-zod helpers)
 */
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLandlordSchema = createInsertSchema(landlords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  propertyCount: true, // propertyCount is managed automatically
});

// Validation: restrict status to allowed values
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rentAmount: z.union([z.string(), z.number()]).transform(val =>
    typeof val === "string" ? parseFloat(val) : val
  ),
  status: z.enum(["available", "rented", "maintenance"]),
  maxTenants: z.coerce.number().int().min(1).default(1),
  currentTenants: z.coerce.number().int().min(0).default(0),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
}).extend({
  leaseStart: z.coerce.date(),
  leaseEnd: z.coerce.date(),
  lastPaymentDate: z.coerce.date().optional(),
  rentAmount: z.union([z.string(), z.number()]).transform(val =>
    typeof val === "string" ? parseFloat(val) : val
  ),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
}).extend({
  rentAmount: z.union([z.string(), z.number()]).transform(val =>
    typeof val === "string" ? parseFloat(val) : val
  ),
  monthlyPremium: z.union([z.string(), z.number()]).transform(val =>
    typeof val === "string" ? parseFloat(val) : val
  ),
});

/**
 * Login schema
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
