import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/custom.js";

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
