import {
  type User,
  type InsertUser,
  type Property,
  type InsertProperty,
  type Tenant,
  type InsertTenant,
  type Quote,
  type InsertQuote,
  users,
  properties,
  tenants,
  quotes,
} from "./schema.js";
import { db } from "./connection.js";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property operations
  getProperties(userId: string): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  // Tenant operations
  getTenants(userId: string): Promise<Tenant[]>;
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
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Property operations
  async getProperties(userId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.userId, userId));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(insertProperty)
      .returning();
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
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tenant operations
  async getTenants(userId: string): Promise<Tenant[]> {
    return await db.select().from(tenants).where(eq(tenants.userId, userId));
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db
      .insert(tenants)
      .values(insertTenant)
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
    const result = await db
      .delete(tenants)
      .where(eq(tenants.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Quote operations
  async getQuotes(userId: string): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.userId, userId));
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values(insertQuote)
      .returning();
    return quote;
  }

}

export const storage = new DatabaseStorage();