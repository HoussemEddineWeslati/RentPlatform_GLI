// src/controllers/configController.ts
import type { Response } from "express";
import type { AuthRequest } from "../types/custom.js";
import { storage } from "../database/storage.js";
import { scoringConfigSchema } from "../validators/configSchema.js";

/**
 * GET /api/config/score
 * Returns the insurer's scoring config (or defaults if none).
 */
export const getScoringConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const cfg = await storage.getScoringConfig(userId);
    if (cfg) return res.json({ success: true, config: cfg });
    // If none, return default (use validator defaults)
    const defaultCfg = scoringConfigSchema.parse({});
    return res.json({ success: true, config: defaultCfg });
  } catch (err) {
    console.error("Get scoring config error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch config" });
  }
};

/**
 * PATCH /api/config/score
 * Upsert (create/update) scoring config for insurer.
 * Body must be validated by scoringConfigSchema.
 */
export const upsertScoringConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const parsed = scoringConfigSchema.parse(req.body);
    const stored = await storage.upsertScoringConfig(userId, parsed);
    return res.json({ success: true, config: stored });
  } catch (err: any) {
    console.error("Upsert scoring config error:", err);
    res.status(400).json({ success: false, message: err?.message ?? "Invalid config" });
  }
};
