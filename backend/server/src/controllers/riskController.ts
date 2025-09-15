// server/src/controllers/riskController.ts
import type { Request, Response } from "express";
import { riskRequestSchema, type RiskRequest } from "../validators/riskSchema.js";
import { computeSafetyScoreAndPd } from "../services/riskService.js";

export const calculateRisk = async (req: Request, res: Response) => {
  try {
    // Validate & sanitize input
    const parsed = riskRequestSchema.parse(req.body) as RiskRequest;

    // Compute
    const result = computeSafetyScoreAndPd(parsed, 0.25);

    // Return structured response
    res.json({
      success: true,
      risk: result,
    });
  } catch (err: any) {
    console.error("Risk calculation error:", err);
    res.status(400).json({ success: false, message: err?.message ?? "Invalid input" });
  }
};
