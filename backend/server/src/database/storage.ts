// export const storage = new DatabaseStorage();
import {
  type User,
  type InsertUser,
  type Property,
  type InsertProperty,
  type Tenant,
  type InsertTenant,
  type Quote,
  type InsertQuote,
  type Landlord,
  type InsertLandlord,
  users,
  properties,
  tenants,
  quotes,
  landlords,
} from "./schema.js";
import { db } from "./connection.js";
import { eq, sql } from "drizzle-orm";
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Landlord operations
  getLandlords(userId: string): Promise<Landlord[]>;
  getLandlord(id: string): Promise<Landlord | undefined>;
  createLandlord(landlord: InsertLandlord): Promise<Landlord>;
  updateLandlord(id: string, landlord: Partial<Landlord>): Promise<Landlord | undefined>;
  deleteLandlord(id: string): Promise<boolean>;

  // Property operations
  getProperties(userId: string): Promise<Property[]>;
  getPropertiesByLandlord(landlordId: string): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;

  // Tenant operations
  getTenants(userId: string): Promise<Tenant[]>;
  getTenantsByLandlord(landlordId: string): Promise<Tenant[]>;
  getTenantsByProperty(propertyId: string): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<Tenant>): Promise<Tenant | undefined>;
  deleteTenant(id: string): Promise<boolean>;

  // Quote operations
  getQuotes(userId: string): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Landlord operations
  async getLandlords(userId: string): Promise<Landlord[]> {
    return await db.select().from(landlords).where(eq(landlords.userId, userId));
  }

  async getLandlord(id: string): Promise<Landlord | undefined> {
    const [landlord] = await db.select().from(landlords).where(eq(landlords.id, id));
    return landlord || undefined;
  }

  async createLandlord(insertLandlord: InsertLandlord): Promise<Landlord> {
    const [landlord] = await db.insert(landlords).values(insertLandlord).returning();
    return landlord;
  }

  async updateLandlord(id: string, landlordUpdate: Partial<Landlord>): Promise<Landlord | undefined> {
    const [updated] = await db
      .update(landlords)
      .set(landlordUpdate)
      .where(eq(landlords.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLandlord(id: string): Promise<boolean> {
    const result = await db.delete(landlords).where(eq(landlords.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Property operations
  async getProperties(userId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.userId, userId));
  }

  async getPropertiesByLandlord(landlordId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.landlordId, landlordId));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    // ensure rentAmount is string for decimal column
    const [property] = await db.insert(properties).values({
      ...insertProperty,
      rentAmount: insertProperty.rentAmount.toString(),
    }).returning();
    return property;
  }

  async updateProperty(id: string, propertyUpdate: Partial<Property>): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set(propertyUpdate)
      .where(eq(properties.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tenant operations
  async getTenants(userId: string): Promise<Tenant[]> {
    return await db.select().from(tenants).where(eq(tenants.userId, userId));
  }
  async getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
    return await db.select().from(tenants).where(eq(tenants.propertyId, propertyId));
  }
  async getTenantsByLandlord(landlordId: string): Promise<any[]> {
    const result = await db
      .select({
        // Fields from the tenants table
        id: tenants.id,
        userId: tenants.userId,
        propertyId: tenants.propertyId,
        name: tenants.name,
        email: tenants.email,
        rentAmount: tenants.rentAmount,
        paymentStatus: tenants.paymentStatus,
        leaseStart: tenants.leaseStart,
        leaseEnd: tenants.leaseEnd,
        lastPaymentDate: tenants.lastPaymentDate,
        createdAt: tenants.createdAt,
        // Field from the properties table
        propertyName: properties.name,
      })
      .from(tenants)
      .innerJoin(properties, eq(tenants.propertyId, properties.id))
      .where(eq(properties.landlordId, landlordId));
    return result;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db
      .insert(tenants)
      .values({
        ...insertTenant,
        rentAmount: insertTenant.rentAmount.toString(), // convert to string
      })
      .returning();
    return tenant;
  }

  async updateTenant(id: string, tenantUpdate: Partial<Tenant>): Promise<Tenant | undefined> {
    const [updated] = await db
      .update(tenants)
      .set(tenantUpdate)
      .where(eq(tenants.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTenant(id: string): Promise<boolean> {
    const result = await db.delete(tenants).where(eq(tenants.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Quote operations
  async getQuotes(userId: string): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.userId, userId));
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values({
        ...insertQuote,
        rentAmount: insertQuote.rentAmount.toString(),
        monthlyPremium: insertQuote.monthlyPremium.toString(),
      })
      .returning();
    return quote;
  }
}

export const storage = new DatabaseStorage();
