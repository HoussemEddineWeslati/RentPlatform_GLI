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
