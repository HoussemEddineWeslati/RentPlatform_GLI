// src/config/constants.ts

/**
 * Centralized configuration for auth-related constants.
 * Checklist 6: Move all “magic numbers” into a config file.
 */
export const AUTH_CONFIG = {
  // OTP settings
  OTP_EXPIRATION_MINUTES: 5,
  OTP_RESEND_COOLDOWN_SECONDS: 60,
  MAX_OTP_ATTEMPTS: 5,

  // Password reset settings
  PASSWORD_RESET_EXPIRATION_HOURS: 1,

  // Hashing rounds
  BCRYPT_ROUNDS: 10,
};