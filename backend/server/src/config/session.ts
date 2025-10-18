// src/config/session.ts

import session, { type SessionOptions } from "express-session";
import memorystore from "memorystore";
const MemoryStore = (memorystore as any)(session);

// Checklist 1: Remove OTP from session, only keep a reference to the email being verified.
declare module "express-session" {
  interface SessionData {
    userId?: string;
    unverifiedEmail?: string; // Keep this to link session to the user verifying
  }
}

const isProd = process.env.NODE_ENV === "production";

export const sessionConfig: SessionOptions = {
  store: new MemoryStore({
    checkPeriod: 1000 * 60 * 60 * 24, // 24h
  }),
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // Checklist 3: Enforce HTTPS cookies in production. Use 'strict' for better CSRF protection.
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
};

export const sessionMiddleware = session(sessionConfig);