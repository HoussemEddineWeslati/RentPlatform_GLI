//src/database/storage.ts
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
  type Policy,
  type InsertPolicy,
  type Claim,
  type InsertClaim,
  users,
  properties,
  tenants,
  quotes,
  landlords,
  policies,
  claims,
} from "./schema.js";
import { db } from "./connection.js";
import { eq, sql, and, gt, desc } from "drizzle-orm";
import { scoringConfigs } from "./schema.js";
import {
  scoringConfigSchema,
  type ScoringConfig as ParsedScoringConfig,
} from "../validators/configSchema.js";


export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>; // NEW
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>; // NEW

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

 // Policy operations
  getAllPolicies(userId: string): Promise<any[]>;
  getPoliciesByLandlord(userId: string, landlordId: string): Promise<any[]>;
  getPoliciesByTenant(userId: string, tenantId: string): Promise<Policy[]>;
  getPolicyById(id: string, userId: string): Promise<any | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: string, userId: string, policy: Partial<Policy>): Promise<Policy | undefined>;
  deletePolicy(id: string, userId: string): Promise<boolean>;

  // Claim operations
  getAllClaims(userId: string): Promise<any[]>;
  getClaimsByLandlord(userId: string, landlordId: string): Promise<any[]>;
  getClaimsByPolicy(userId: string, policyId: string): Promise<Claim[]>;
  getClaimsByTenant(userId: string, tenantId: string): Promise<any[]>;
  getClaimById(id: string, userId: string): Promise<any | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: string, userId: string, claim: Partial<Claim>): Promise<Claim | undefined>;
  deleteClaim(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // --- User operations ---
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gt(users.resetPasswordExpires, sql`now()`)
        )
      );
    return user || undefined;
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(
    id: string,
    userUpdate: Partial<User>
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
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


// --- Policy operations ---
    async getAllPolicies(userId: string): Promise<any[]> {
        return await db.select({
            id: policies.id, policyNumber: policies.policyNumber, status: policies.status,
            tenantName: tenants.name, landlordName: landlords.name
        }).from(policies)
        .innerJoin(tenants, eq(policies.tenantId, tenants.id))
        .innerJoin(landlords, eq(policies.landlordId, landlords.id))
        .where(eq(policies.userId, userId)).orderBy(desc(policies.createdAt));
    }
    async getPoliciesByLandlord(userId: string, landlordId: string): Promise<any[]> {
        return await db.select({
            id: policies.id, policyNumber: policies.policyNumber, riskScore: policies.riskScore,
            status: policies.status, tenantName: tenants.name, propertyName: properties.name,
        }).from(policies)
        .innerJoin(tenants, eq(policies.tenantId, tenants.id))
        .innerJoin(properties, eq(policies.propertyId, properties.id))
        .where(and(eq(policies.userId, userId), eq(policies.landlordId, landlordId)))
        .orderBy(desc(policies.createdAt));
    }
    async getPoliciesByTenant(userId: string, tenantId: string): Promise<Policy[]> {
        return await db.select().from(policies)
            .where(and(eq(policies.userId, userId), eq(policies.tenantId, tenantId)));
    }

    /**
     * FIXED: This function now correctly selects nested objects.
     */
    async getPolicyById(id: string, userId: string): Promise<any | undefined> {
        const [result] = await db.select({
            // Assign each table to a key to create a nested result object
            policy: policies,
            tenant: tenants,
            property: properties,
            landlord: landlords,
        }).from(policies)
        .innerJoin(tenants, eq(policies.tenantId, tenants.id))
        .innerJoin(properties, eq(policies.propertyId, properties.id))
        .innerJoin(landlords, eq(policies.landlordId, landlords.id))
        .where(and(eq(policies.id, id), eq(policies.userId, userId)));
        
        // The result will be an object like: { policy: {...}, tenant: {...}, ... }
        return result || undefined;
    }

    async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
        const policyNumber = `GLI-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-6)}`;
        const [policy] = await db.insert(policies).values({
            ...insertPolicy,
            policyNumber,
            riskScore: insertPolicy.riskScore.toString(),
            premiumAmount: insertPolicy.premiumAmount.toString(),
        }).returning();
        return policy;
    }
    async updatePolicy(id: string, userId: string, policyUpdate: Partial<Policy>): Promise<Policy | undefined> {
        const [updated] = await db.update(policies).set({ ...policyUpdate, updatedAt: sql`now()` }).where(and(eq(policies.id, id), eq(policies.userId, userId))).returning();
        return updated || undefined;
    }
    async deletePolicy(id: string, userId: string): Promise<boolean> {
        const existingClaims = await db.select().from(claims).where(eq(claims.policyId, id)).limit(1);
        if (existingClaims.length > 0) {
            throw new Error("Cannot delete a policy with active claims.");
        }
        const result = await db.delete(policies).where(and(eq(policies.id, id), eq(policies.userId, userId)));
        return result.rowCount !== null && result.rowCount > 0;
    }

    // --- Claim operations ---
    async getAllClaims(userId: string): Promise<any[]> {
        return await db.select({
            id: claims.id, claimNumber: claims.claimNumber, status: claims.status,
            amountRequested: claims.amountRequested, policyNumber: policies.policyNumber, landlordName: landlords.name
        }).from(claims)
        .innerJoin(policies, eq(claims.policyId, policies.id))
        .innerJoin(landlords, eq(policies.landlordId, landlords.id))
        .where(eq(claims.userId, userId)).orderBy(desc(claims.createdAt));
    }
    async getClaimsByLandlord(userId: string, landlordId: string): Promise<any[]> {
        return await db.select({
            id: claims.id, claimNumber: claims.claimNumber, amountRequested: claims.amountRequested,
            status: claims.status, policyNumber: policies.policyNumber
        }).from(claims)
        .innerJoin(policies, eq(claims.policyId, policies.id))
        .where(and(eq(claims.userId, userId), eq(policies.landlordId, landlordId)))
        .orderBy(desc(claims.createdAt));
    }
    async getClaimsByPolicy(userId: string, policyId: string): Promise<Claim[]> {
        return await db.select().from(claims)
            .where(and(eq(claims.userId, userId), eq(claims.policyId, policyId)));
    }
    async getClaimsByTenant(userId: string, tenantId: string): Promise<any[]> {
        return await db.select({
            id: claims.id, claimNumber: claims.claimNumber, status: claims.status,
            amountRequested: claims.amountRequested, policyNumber: policies.policyNumber
        }).from(claims)
        .innerJoin(policies, eq(claims.policyId, policies.id))
        .where(and(eq(claims.userId, userId), eq(policies.tenantId, tenantId)))
        .orderBy(desc(claims.createdAt));
    }
    
    /**
     * FIXED: This function now correctly selects nested objects.
     */
    async getClaimById(id: string, userId: string): Promise<any | undefined> {
        const [result] = await db.select({
            // Assign each table to a key
            claim: claims,
            policy: policies,
            tenant: tenants
        }).from(claims)
        .innerJoin(policies, eq(claims.policyId, policies.id))
        .innerJoin(tenants, eq(policies.tenantId, tenants.id))
        .where(and(eq(claims.id, id), eq(claims.userId, userId)));
        
        return result || undefined;
    }

    async createClaim(insertClaim: InsertClaim): Promise<Claim> {
        const claimNumber = `CLM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-6)}`;
        const [claim] = await db.insert(claims).values({
            ...insertClaim,
            claimNumber,
            amountRequested: insertClaim.amountRequested.toString(),
        }).returning();
        return claim;
    }
    async updateClaim(id: string, userId: string, claimUpdate: Partial<Claim>): Promise<Claim | undefined> {
        const [updated] = await db.update(claims).set({ ...claimUpdate, updatedAt: sql`now()` }).where(and(eq(claims.id, id), eq(claims.userId, userId))).returning();
        return updated || undefined;
    }
    async deleteClaim(id: string, userId: string): Promise<boolean> {
        const result = await db.delete(claims).where(and(eq(claims.id, id), eq(claims.userId, userId)));
        return result.rowCount !== null && result.rowCount > 0;
    }

  // Scoring config operations
async getScoringConfig(userId: string): Promise<ParsedScoringConfig | undefined> {
  const [row] = await db
    .select()
    .from(scoringConfigs)
    .where(eq(scoringConfigs.userId, userId));

  if (!row) return undefined;

  try {
    // Validate against Zod schema
    return scoringConfigSchema.parse(JSON.parse(row.configJson));
  } catch (e) {
    console.error("Failed to parse scoring config JSON:", e);
    return undefined;
  }
}

/**
 * Upsert scoring config for user. 
 * If row exists => update updatedAt + configJson.
 * Returns stored config (validated).
 */
async upsertScoringConfig(
  userId: string, 
  configObj: unknown
): Promise<ParsedScoringConfig> {
  // Validate first before persisting
  const parsed = scoringConfigSchema.parse(configObj);
  const configJson = JSON.stringify(parsed);

  // Try update first
  const [updated] = await db
    .update(scoringConfigs)
    .set({
      configJson,
      updatedAt: sql`now()`,
    })
    .where(eq(scoringConfigs.userId, userId))
    .returning();

  if (updated) {
    return scoringConfigSchema.parse(JSON.parse(updated.configJson));
  }

  // Insert if no existing row
  const [inserted] = await db
    .insert(scoringConfigs)
    .values({
      userId,
      configJson,
    })
    .returning();

  return scoringConfigSchema.parse(JSON.parse(inserted.configJson));
}
}



export const storage = new DatabaseStorage();
