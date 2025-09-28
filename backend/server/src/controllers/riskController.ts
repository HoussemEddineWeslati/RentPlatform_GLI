// src/controllers/riskController.ts

import type { Request, Response } from "express";
import { riskRequestSchema, riskReportRequestSchema, type RiskRequest } from "../validators/riskSchema.js";
import { computeSafetyScoreAndPd } from "../services/riskService.js";
import { generateRiskReportPDF } from "../services/pdfGenerator.js";

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

/**
 * NEW: Controller to generate and stream a PDF risk report.
 */
export const generateRiskReport = async (req: Request, res: Response) => {
    try {
        // 1. Validate the extended input for the report
        const reportData = riskReportRequestSchema.parse(req.body);

        // 2. Compute the risk score using the existing service
        const riskResult = computeSafetyScoreAndPd(reportData, 0.25);

        // 3. Set headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="risk-assessment-report.pdf"');

        // 4. Generate the PDF and stream it to the response
        generateRiskReportPDF(reportData, riskResult, res);

    } catch (err: any) {
        console.error("PDF Report generation error:", err);
        res.status(400).json({ success: false, message: err?.message ?? "Invalid input for report" });
    }
};