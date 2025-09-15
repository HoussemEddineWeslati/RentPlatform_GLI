import type { Express } from "express";
import { createServer, type Server } from "http";
import { sessionMiddleware } from "../config/session.js";
import { requireAuth } from "../middleware/auth.js";

// Controllers
import * as authController from "../controllers/authController.js";
import * as propertyController from "../controllers/propertyController.js";
import * as tenantController from "../controllers/tenantController.js";
import * as quoteController from "../controllers/quoteController.js";
import * as riskController from "../controllers/riskController.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware (use the middleware exported from config/session)
  app.use(sessionMiddleware);

  // Auth routes
  app.post("/api/auth/signup", authController.signup);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  // app.get("/api/auth/user", requireAuth, authController.getUser);
  app.get("/api/auth/user", authController.getUser);

  // Property routes
  app.get("/api/properties", requireAuth, propertyController.getProperties);
  app.post("/api/properties", requireAuth, propertyController.createProperty);
  app.patch("/api/properties/:id", requireAuth, propertyController.updateProperty);
  app.delete("/api/properties/:id", requireAuth, propertyController.deleteProperty);

  // Tenant routes
  app.get("/api/tenants", requireAuth, tenantController.getTenants);
  app.post("/api/tenants", requireAuth, tenantController.createTenant);
  app.patch("/api/tenants/:id", requireAuth, tenantController.updateTenant);
  app.delete("/api/tenants/:id", requireAuth, tenantController.deleteTenant);

  // Quote routes
  app.get("/api/quotes", requireAuth, quoteController.getQuotes);
  app.post("/api/quotes", requireAuth, quoteController.createQuote);

  app.post("/api/risk/calculate", requireAuth, riskController.calculateRisk);

  const httpServer = createServer(app);
  return httpServer;
}
