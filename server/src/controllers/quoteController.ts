import { Request, Response } from 'express';
import { storage } from "../database/storage.js";
import { insertQuoteSchema } from "../database/schema.js";

export const getQuotes = async (req: any, res: Response) => {
  try {
    const quotes = await storage.getQuotes(req.session.userId);
    res.json(quotes);
  } catch (error) {
    console.error("Get quotes error:", error);
    res.status(500).json({ message: "Failed to fetch quotes" });
  }
};

export const createQuote = async (req: any, res: Response) => {
  try {
    const { rentAmount, riskFactor, coverageLevel } = req.body;
    
    // Calculate premium
    let basePremium = parseFloat(rentAmount) * 0.03; // 3% of rent
    
    const riskMultipliers: { [key: string]: number } = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3
    };
    
    const coverageMultipliers: { [key: string]: number } = {
      'basic': 0.7,
      'standard': 1.0,
      'premium': 1.5
    };
    
    const monthlyPremium = Math.round(basePremium * (riskMultipliers[riskFactor] || 1.0) * (coverageMultipliers[coverageLevel] || 1.0));
    
    const quoteData = insertQuoteSchema.parse({
      userId: req.session.userId,
      rentAmount,
      riskFactor,
      coverageLevel,
      monthlyPremium: monthlyPremium.toString()
    });
    
    const quote = await storage.createQuote(quoteData);
    res.json(quote);
  } catch (error) {
    console.error("Create quote error:", error);
    res.status(400).json({ message: "Invalid quote data" });
  }
};