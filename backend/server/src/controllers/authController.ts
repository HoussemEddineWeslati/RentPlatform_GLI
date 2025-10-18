// src/controllers/authController.ts

import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "../database/storage.js";
import { insertUserSchema, loginSchema } from "../database/schema.js";
import * as emailService from "../services/emailService.js";
import { AUTH_CONFIG } from "../config/contants.js";

import type { User } from "../database/schema.js";

// Helper function for OTP generation
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

/**
 * Sets OTP details on a user object before updating the database.
 */
const setOtpForUser = async (user: User) => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, AUTH_CONFIG.BCRYPT_ROUNDS);
  const otpExpires = new Date(Date.now() + AUTH_CONFIG.OTP_EXPIRATION_MINUTES * 60 * 1000);

  await storage.updateUser(user.id, {
    otpHash,
    otpExpires,
    otpAttempts: 0, // Reset attempts on new OTP
    lastOtpSentAt: new Date(),
  });

  return otp; // Return plaintext OTP to be emailed
};

export const signup = async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    if (await storage.getUserByEmail(userData.email)) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(userData.password, AUTH_CONFIG.BCRYPT_ROUNDS);
    const user = await storage.createUser({ ...userData, password: hashedPassword });

    // Checklist 1: Generate and store hashed OTP in DB
    const otp = await setOtpForUser(user);
    await emailService.sendVerificationEmail(user.email, otp);

    // Store unverified email in session to link verification attempts
    req.session.unverifiedEmail = user.email;

    return res.status(201).json({
      success: true,
      message: "Signup successful. Please check your email for a verification code.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(400).json({ success: false, message: "Invalid user data" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Ensure the session is trying to verify the correct email
    if (req.session.unverifiedEmail !== email) {
      return res.status(400).json({ success: false, message: "Verification session mismatch." });
    }

    const user = await storage.getUserByEmail(email);
    if (!user || !user.otpHash || !user.otpExpires) {
      return res.status(400).json({ success: false, message: "No pending verification found." });
    }

    // Checklist 1: Rate limit attempts and check expiry from DB
    if (user.otpAttempts >= AUTH_CONFIG.MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ success: false, message: "Too many attempts. Please request a new code." });
    }
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Checklist 1: Use bcrypt to compare OTP
    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      await storage.updateUser(user.id, { otpAttempts: (user.otpAttempts || 0) + 1 });
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Success: Invalidate OTP and mark user as verified
    const updatedUser = await storage.updateUser(user.id, {
      isVerified: true,
      otpHash: undefined,
      otpExpires: undefined,
      otpAttempts: 0,
    });
    if (!updatedUser) throw new Error("Failed to update user verification status");

    // Clear session and log in
    req.session.unverifiedEmail = undefined;
    req.session.userId = updatedUser.id;
    
    // Checklist 2: Send verification success email
    await emailService.sendVerificationSuccessEmail(updatedUser.email);
    
    const { password, ...userWithoutPassword } = updatedUser;
    return res.json({ success: true, message: "Email verified successfully.", data: userWithoutPassword });
  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ success: false, message: "Failed to verify email." });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await storage.getUserByEmail(email);

    if (!user) {
      // Do not leak user existence
      return res.json({ success: true, message: "If an account exists, a new OTP has been sent." });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified." });
    }

    // Checklist 1: Implement resend cooldown
    if (user.lastOtpSentAt) {
      const cooldown = AUTH_CONFIG.OTP_RESEND_COOLDOWN_SECONDS * 1000;
      const timeSinceLast = Date.now() - user.lastOtpSentAt.getTime();
      if (timeSinceLast < cooldown) {
        return res.status(429).json({ success: false, message: `Please wait ${Math.ceil((cooldown - timeSinceLast) / 1000)} seconds before trying again.` });
      }
    }

    const otp = await setOtpForUser(user);
    await emailService.sendVerificationEmail(user.email, otp);

    req.session.unverifiedEmail = user.email; // Refresh session link

    return res.json({ success: true, message: "A new OTP has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ success: false, message: "Failed to resend OTP." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    // Checklist 4: Block login if not verified (already implemented)
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email address." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    req.session.userId = user.id;
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
};

export const getUser = async (req: Request, res: Response) => {
  try {
    if (!req.session?.userId) return res.json(null);
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { password, ...userWithoutPassword } = user;
    return res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Old password and a new password (min 6 chars) are required." });
    }

    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect old password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, AUTH_CONFIG.BCRYPT_ROUNDS);
    await storage.updateUser(userId, { password: hashedNewPassword });

    // Checklist 2 & 5: Send password changed confirmation
    await emailService.sendPasswordChangedConfirmation(user.email);

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ success: false, message: "Failed to change password." });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await storage.getUserByEmail(email);
    const successMessage = "If an account with that email exists, a reset link has been sent.";

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      // Checklist 3 & 5: Hash token before saving to DB
      const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      console.log("Password Reset Hours:", AUTH_CONFIG.PASSWORD_RESET_EXPIRATION_HOURS);

      const resetPasswordExpires = new Date(Date.now() + AUTH_CONFIG.PASSWORD_RESET_EXPIRATION_HOURS * 60 * 60 * 1000);
      console.log("Calculated Expiration (Full Object):", resetPasswordExpires.toISOString());

      await storage.updateUser(user.id, { resetPasswordToken, resetPasswordExpires });
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    }
    // Checklist 3: Do not leak user existence (already implemented)
    return res.json({ success: true, message: successMessage });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, message: "Failed to initiate password reset." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    // Checklist 3 & 5: Hash incoming token to match the one in the DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await storage.getUserByResetToken(hashedToken);

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);
    // Checklist 3 & 5: Invalidate token after use
    await storage.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    await emailService.sendPasswordChangedConfirmation(user.email);
    
    return res.json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, message: "Failed to reset password." });
  }
};

// ... (updateProfile function remains the same)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { firstName, lastName, companyName } = req.body;
    const updateData: { [key: string]: any } = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (companyName) updateData.companyName = companyName;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No update data provided." });
    }

    const updatedUser = await storage.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};