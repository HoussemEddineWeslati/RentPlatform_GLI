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

export const sessionConfig = {
  store: new sessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};