// src/controllers/riskController.ts
import type { Response } from "express";
import { storage } from "../database/storage.js";
import type { AuthRequest } from "../types/custom.js";
import { riskRequestSchema, riskReportRequestSchema } from "../validators/riskSchema.js";
import { computeSafetyScoreAndPd } from "../services/riskService.js";
import { generateRiskReportPDF } from "../services/pdfGenerator.js";

/**
 * Calculates the risk score for a tenant.
 * This is now an authenticated endpoint to load the correct user's scoring config.
 */
export const calculateRisk = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate & sanitize input
    const parsed = riskRequestSchema.parse(req.body);

    // 2. Fetch the scoring configuration for the authenticated user (insurer)
    const userId = req.session.userId!;
    const scoringConfig = await storage.getScoringConfig(userId);

    // 3. Compute the score, passing the user's config to the service.
    // The service will use defaults if no config is found.
    const result = computeSafetyScoreAndPd(parsed, undefined, scoringConfig);

    // 4. Return structured response
    res.json({
      success: true,
      risk: result,
    });
  } catch (err: any) {
    console.error("Risk calculation error:", err);
    res.status(400).json({ success: false, message: err?.message ?? "Invalid input" });
  }
};

/**
 * Generates and streams a PDF risk report.
 * This is now an authenticated endpoint to load the correct user's scoring config.
 */
export const generateRiskReport = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Validate the extended input for the report
        const reportData = riskReportRequestSchema.parse(req.body);

        // 2. Fetch the scoring configuration for the authenticated user
        const userId = req.session.userId!;
        const scoringConfig = await storage.getScoringConfig(userId);

        // 3. Compute the risk score using the existing service and the user's config
        const riskResult = computeSafetyScoreAndPd(reportData, undefined, scoringConfig);

        // 4. Set headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="risk-assessment-report.pdf"');

        // 5. Generate the PDF and stream it to the response
        generateRiskReportPDF(reportData, riskResult, res);
    } catch (err: any) {
        console.error("PDF Report generation error:", err);
        res.status(400).json({ success: false, message: err?.message ?? "Invalid input for report" });
    }
};
