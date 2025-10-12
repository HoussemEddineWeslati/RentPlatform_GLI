//src/config/session.ts
import session, { type SessionOptions } from "express-session";
import memorystore from "memorystore";

const MemoryStore = (memorystore as any)(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
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
    secure: isProd, // require HTTPS in prod
    sameSite: isProd ? "none" : "lax", // use None in prod for cross-site cookies; lax in dev
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
};

export const sessionMiddleware = session(sessionConfig);
