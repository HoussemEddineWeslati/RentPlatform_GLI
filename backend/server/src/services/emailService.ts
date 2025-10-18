// src/services/emailService.ts

import nodemailer from "nodemailer";
import "dotenv/config";
import { getOtpVerificationHtml } from "./emailTemplate.js"; // Assume this exists and is styled

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const appName = "GLI PRO";
const fromEmail = `"${appName}" <${process.env.EMAIL_USER}>`;

/**
 * Checklist 2: Standardize email templates.
 */
export const sendVerificationEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: fromEmail,
    to,
    subject: `Verify Your Email for ${appName}`,
    html: getOtpVerificationHtml({ otp, email: to, appName }),
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Checklist 2: New verification success email.
 */
export const sendVerificationSuccessEmail = async (to: string) => {
  const mailOptions = {
    from: fromEmail,
    to,
    subject: `✅ Your Account is Verified`,
    html: `<p>Welcome to ${appName}! Your email address has been successfully verified.</p>`,
  };
  await transporter.sendMail(mailOptions);
}

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const mailOptions = {
    from: fromEmail,
    to,
    subject: `Password Reset Request for ${appName}`,
    html: `
      <p>A password reset was requested for your account. Click the link below to reset it.</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Checklist 2 & 5: Add confirmation email after password change.
 */
export const sendPasswordChangedConfirmation = async (to: string) => {
  const forgotPasswordLink = `${process.env.FRONTEND_URL}/forgot-password`;
  const mailOptions = {
    from: fromEmail,
    to,
    subject: `🔒 Your Password Has Been Changed`,
    html: `
      <p>This email confirms that the password for your ${appName} account has been changed.</p>
      <p>If you did not make this change, please <a href="${forgotPasswordLink}">reset your password immediately</a> to secure your account.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};