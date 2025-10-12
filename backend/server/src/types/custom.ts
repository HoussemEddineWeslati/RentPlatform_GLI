//src/types/custom.ts
import type { Request } from "express";
import type { Session, SessionData } from "express-session";

/**
 * AuthRequest used across controllers/middlewares.
 * session is Session & Partial<SessionData> to match express-session expectations,
 * plus we state userId?: string for convenience.
 */
export interface AuthRequest extends Request {
  session: Session & Partial<SessionData> & { userId?: string };
}
