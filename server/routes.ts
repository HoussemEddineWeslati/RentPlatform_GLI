import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  insertPropertySchema,
  insertTenantSchema,
  insertQuoteSchema,
 
} from "./schema.js";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";

// Session configuration
const sessionStore = MemoryStore(session);

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: new sessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Create session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Property routes
  app.get("/api/properties", requireAuth, async (req: any, res) => {
    try {
      const properties = await storage.getProperties(req.session.userId);
      res.json(properties);
    } catch (error) {
      console.error("Get properties error:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post("/api/properties", requireAuth, async (req: any, res) => {
    try {
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      console.error("Create property error:", error);
      res.status(400).json({ message: "Invalid property data" });
    }
  });

  app.patch("/api/properties/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const property = await storage.updateProperty(id, req.body);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Update property error:", error);
      res.status(400).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProperty(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Delete property error:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Tenant routes
  app.get("/api/tenants", requireAuth, async (req: any, res) => {
    try {
      const tenants = await storage.getTenants(req.session.userId);
      res.json(tenants);
    } catch (error) {
      console.error("Get tenants error:", error);
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  app.post("/api/tenants", requireAuth, async (req: any, res) => {
    try {
      // Convert date strings to Date objects before validation
      const processedBody = {
        ...req.body,
        leaseStart: new Date(req.body.leaseStart),
        leaseEnd: new Date(req.body.leaseEnd),
        userId: req.session.userId
      };
      
      const tenantData = insertTenantSchema.parse(processedBody);
      
      const tenant = await storage.createTenant(tenantData);
      res.json(tenant);
    } catch (error) {
      console.error("Create tenant error:", error);
      res.status(400).json({ message: "Invalid tenant data" });
    }
  });

  app.patch("/api/tenants/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const tenant = await storage.updateTenant(id, req.body);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      res.json(tenant);
    } catch (error) {
      console.error("Update tenant error:", error);
      res.status(400).json({ message: "Failed to update tenant" });
    }
  });

  app.delete("/api/tenants/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTenant(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      res.json({ message: "Tenant deleted successfully" });
    } catch (error) {
      console.error("Delete tenant error:", error);
      res.status(500).json({ message: "Failed to delete tenant" });
    }
  });

  // Quote routes
  app.get("/api/quotes", requireAuth, async (req: any, res) => {
    try {
      const quotes = await storage.getQuotes(req.session.userId);
      res.json(quotes);
    } catch (error) {
      console.error("Get quotes error:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post("/api/quotes", requireAuth, async (req: any, res) => {
    try {
      const { rentAmount, riskFactor, coverageLevel } = req.body;
      
      // Calculate premium
      let basePremium = parseFloat(rentAmount) * 0.03; // 3% of rent
      
      const riskMultipliers: { [key: string]: number } = {
        'low': 0.8,
        'medium': 1.0,
        'high': 1.3
      };
      
      const coverageMultipliers: { [key: string]: number } = {
        'basic': 0.7,
        'standard': 1.0,
        'premium': 1.5
      };
      
      const monthlyPremium = Math.round(basePremium * (riskMultipliers[riskFactor] || 1.0) * (coverageMultipliers[coverageLevel] || 1.0));
      
      const quoteData = insertQuoteSchema.parse({
        userId: req.session.userId,
        rentAmount,
        riskFactor,
        coverageLevel,
        monthlyPremium: monthlyPremium.toString()
      });
      
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error) {
      console.error("Create quote error:", error);
      res.status(400).json({ message: "Invalid quote data" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
