// src/routes/index.ts

import type { Express } from "express";
import { createServer, type Server } from "http";
import { sessionMiddleware } from "../config/session.js";
import { requireAuth } from "../middleware/auth.js";
// Controllers
import * as authController from "../controllers/authController.js";
import * as propertyController from "../controllers/propertyController.js";
import * as tenantController from "../controllers/tenantController.js";
import * as quoteController from "../controllers/quoteController.js";
import * as landlordController from "../controllers/landlordController.js";
import * as riskController from "../controllers/riskController.js";
import * as configController from "../controllers/configController.js"; // <-- 1. IMPORT CONFIG CONTROLLER

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(sessionMiddleware);

  // Auth routes
  app.post("/api/auth/signup", authController.signup);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/user", authController.getUser);

  // Landlord routes
  app.get("/api/landlords", requireAuth, landlordController.getLandlords);
  app.post("/api/landlords", requireAuth, landlordController.createLandlord);
  app.get("/api/landlords/:id", requireAuth, landlordController.getLandlord);
  app.patch("/api/landlords/:id", requireAuth, landlordController.updateLandlord);
  app.delete("/api/landlords/:id", requireAuth, landlordController.deleteLandlord);

  // Landlord related lists
  app.get("/api/landlords/:id/properties", requireAuth, landlordController.getLandlordProperties);
  app.get("/api/landlords/:id/tenants", requireAuth, landlordController.getLandlordTenants);
  
  // Property routes
  app.get("/api/properties", requireAuth, propertyController.getProperties);
  app.post("/api/properties", requireAuth, propertyController.createProperty);
  app.patch("/api/properties/:id", requireAuth, propertyController.updateProperty);
  app.delete("/api/properties/:id", requireAuth, propertyController.deleteProperty);
  app.get("/api/properties/:propertyId/tenants", requireAuth, tenantController.getTenantsByProperty);
  
  // Tenant routes
  app.get("/api/tenants", requireAuth, tenantController.getTenants);
  app.post("/api/tenants", requireAuth, tenantController.createTenant);
  app.patch("/api/tenants/:id", requireAuth, tenantController.updateTenant);
  app.delete("/api/tenants/:id", requireAuth, tenantController.deleteTenant);
  
  // Quote routes
  app.get("/api/quotes", requireAuth, quoteController.getQuotes);
  app.post("/api/quotes", requireAuth, quoteController.createQuote);

  // Risk routes
  app.post("/api/risk/calculate", requireAuth, riskController.calculateRisk);
  app.post("/api/risk/report", requireAuth, riskController.generateRiskReport);

  // <-- 2. ADD CONFIG ROUTES HERE -->
  // Scoring config routes
  app.get("/api/config/score", requireAuth, configController.getScoringConfig);
  app.patch("/api/config/score", requireAuth, configController.upsertScoringConfig);

  const httpServer = createServer(app);
  return httpServer;
}