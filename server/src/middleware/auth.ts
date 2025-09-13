import { Request, Response, NextFunction } from 'express';

// Auth middleware
export const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};