// src/routes/index.ts

// Routes
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import landlordRoutes from "./landlord.routes.js";
import policyRoutes from "./policy.routes.js";
import claimRoutes from "./claim.routes.js";
import propertyRoutes from "./property.routes.js";
import tenantRoutes from "./tenant.routes.js";
import decisionRoutes from "./decisioning.routes.js";
// import quoteRoutes from "./quote.routes.js";
// import configRoutes from "./config.routes.js";
export const registerRoutes = (app: Router) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/landlords", landlordRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api", tenantRoutes);
  app.use("/api", decisionRoutes);

  app.use("/api/policies", policyRoutes);
  app.use("/api/claims", claimRoutes);
};



// Function to register all routes
// export async function registerRoutes(app: Express): Promise<Server> {
//   // Session middleware
//   app.use(sessionMiddleware);

//   // --- Auth & User Management Routes (UPDATED) ---
//   app.post("/api/auth/signup", sensitiveActionLimiter, authController.signup);
//   app.post("/api/auth/verify-email", sensitiveActionLimiter, authController.verifyEmail);
//   // NEW endpoint for resending OTP
//   app.post("/api/auth/resend-otp", sensitiveActionLimiter, authController.resendOtp);
//   app.post("/api/auth/login", sensitiveActionLimiter, authController.login);
//   app.post("/api/auth/logout", authController.logout);
//   app.get("/api/auth/user", authController.getUser);

//   // Password management
//   app.post("/api/auth/forgot-password", sensitiveActionLimiter, authController.forgotPassword);
//   app.post("/api/auth/reset-password/:token", sensitiveActionLimiter, authController.resetPassword);

//   // Authenticated user actions
//   app.patch("/api/auth/update-profile", requireAuth, authController.updateProfile);
//   app.post("/api/auth/change-password", requireAuth, sensitiveActionLimiter, authController.changePassword);
  
//   // ... (rest of the routes are unchanged)
//   // --- Landlord routes ---
//   app.get("/api/landlords", requireAuth, landlordController.getLandlords);
//   app.post("/api/landlords", requireAuth, landlordController.createLandlord);
//   app.get("/api/landlords/:id", requireAuth, landlordController.getLandlord);
//   app.patch(
//     "/api/landlords/:id",
//     requireAuth,
//     landlordController.updateLandlord
//   );
//   app.delete(
//     "/api/landlords/:id",
//     requireAuth,
//     landlordController.deleteLandlord
//   );
//   app.get(
//     "/api/landlords/:id/properties",
//     requireAuth,
//     landlordController.getLandlordProperties
//   );
//   app.get(
//     "/api/landlords/:id/tenants",
//     requireAuth,
//     landlordController.getLandlordTenants
//   );

//   // --- Property routes ---
//   app.get("/api/properties", requireAuth, propertyController.getProperties);
//   app.post("/api/properties", requireAuth, propertyController.createProperty);
//   app.patch(
//     "/api/properties/:id",
//     requireAuth,
//     propertyController.updateProperty
//   );
//   app.delete(
//     "/api/properties/:id",
//     requireAuth,
//     propertyController.deleteProperty
//   );

  
//   // --- Tenant routes ---
//   app.get(
//     "/api/properties/:propertyId/tenants",
//     requireAuth,
//     tenantController.getTenantsByProperty
//   );

//   app.get("/api/tenants", requireAuth, tenantController.getTenants);
//   app.post("/api/tenants", requireAuth, tenantController.createTenant);
//   app.patch("/api/tenants/:id", requireAuth, tenantController.updateTenant);
//   app.delete("/api/tenants/:id", requireAuth, tenantController.deleteTenant);

//   // --- Quote routes ---
//   app.get("/api/quotes", requireAuth, quoteController.getQuotes);
//   app.post("/api/quotes", requireAuth, quoteController.createQuote);

//   // --- Risk routes ---
//   app.post("/api/risk/calculate", requireAuth, riskController.calculateRisk);
//   app.post("/api/risk/report", requireAuth, riskController.generateRiskReport);
  
//   // --- Scoring config routes ---
//   app.get("/api/config/score", requireAuth, configController.getScoringConfig);
//   app.patch(
//     "/api/config/score",
//     requireAuth,
//     configController.upsertScoringConfig
//   );

//   const httpServer = createServer(app);
//   return httpServer;
// }