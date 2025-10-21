// src/routes/auth.routes.ts - UPDATE WITH NEW ROUTES

import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { sensitiveActionLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/user", authController.getUser);
router.post("/verify-email", sensitiveActionLimiter, authController.verifyEmail);
router.post("/resend-otp", sensitiveActionLimiter, authController.resendOtp);
router.post("/forgot-password", sensitiveActionLimiter, authController.forgotPassword);
router.post("/reset-password/:token", sensitiveActionLimiter, authController.resetPassword);

// Protected profile routes
router.get("/profile", requireAuth, authController.getProfile);
router.patch("/profile", requireAuth, authController.updateProfile);
router.post("/change-password", requireAuth, authController.changePassword);
router.delete("/account", requireAuth, sensitiveActionLimiter, authController.deleteAccount);

export default router;