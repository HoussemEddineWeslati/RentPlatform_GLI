import { Request, Response } from "express";
import { storage } from "../database/storage.js";
import { insertQuoteSchema } from "../database/schema.js";
import type { AuthRequest } from "../types/custom.js";

export const getQuotes = async (req: AuthRequest, res: Response) => {
  try {
    const quotes = await storage.getQuotes(req.session.userId!);
    res.json(quotes);
  } catch (err) {
    console.error("Get quotes error:", err);
    res.status(500).json({ message: "Failed to fetch quotes" });
  }
};

export const createQuote = async (req: AuthRequest, res: Response) => {
  try {
    const { rentAmount, riskFactor, coverageLevel } = req.body;

    let basePremium = parseFloat(rentAmount) * 0.03;

    const riskMultipliers = { low: 0.8, medium: 1.0, high: 1.3 };
    const coverageMultipliers = { basic: 0.7, standard: 1.0, premium: 1.5 };

    const monthlyPremium = Math.round(
      basePremium *
        (riskMultipliers[riskFactor] ?? 1.0) *
        (coverageMultipliers[coverageLevel] ?? 1.0)
    );

    const quoteData = insertQuoteSchema.parse({
      userId: req.session.userId,
      rentAmount,
      riskFactor,
      coverageLevel,
      monthlyPremium, // 👈 number not string
    });

    const quote = await storage.createQuote(quoteData);
    res.json(quote);
  } catch (err) {
    console.error("Create quote error:", err);
    res.status(400).json({ message: "Invalid quote data" });
  }
};
