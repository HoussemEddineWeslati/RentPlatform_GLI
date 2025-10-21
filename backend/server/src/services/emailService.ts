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


/**
 * Send account deletion confirmation email
 */
export const sendAccountDeletionConfirmation = async (to: string) => {
  const mailOptions = {
    from: fromEmail,
    to,
    subject: `Account Deleted - ${appName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Account Deletion Confirmation</h2>
        <p>This email confirms that your ${appName} account has been permanently deleted.</p>
        <p>All your data, including:</p>
        <ul>
          <li>Personal information</li>
          <li>Landlords</li>
          <li>Properties</li>
          <li>Tenants</li>
          <li>Policies</li>
          <li>Claims</li>
        </ul>
        <p>has been removed from our system.</p>
        <p>If you did not request this deletion, please contact our support team immediately at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>.</p>
        <p>We're sorry to see you go. If you have any feedback about your experience, we'd love to hear from you.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};