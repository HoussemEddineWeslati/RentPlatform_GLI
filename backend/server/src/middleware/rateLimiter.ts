// src/middleware/rateLimiter.ts

import rateLimit from "express-rate-limit";

/**
 * Checklist 1 & 6: Add rate limiting to prevent brute-force attacks.
 */

// Used for sensitive actions like verifying an OTP or requesting a password reset
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again after 15 minutes." },
});

// Used for general API requests
export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});