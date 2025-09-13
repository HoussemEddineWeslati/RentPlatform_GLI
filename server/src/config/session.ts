import session from "express-session";
import MemoryStore from "memorystore";

// Session configuration
const sessionStore = MemoryStore(session);

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Require SESSION_SECRET in production
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET environment variable is required in production");
}

export const sessionConfig = {
  store: new sessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: sessionSecret || "dev-only-fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};