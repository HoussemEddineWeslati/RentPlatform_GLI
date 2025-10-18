import { Router } from "express";
import * as riskController from "../controllers/riskController.js";
import * as quoteController from "../controllers/quoteController.js";
import * as configController from "../controllers/configController.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);

//   // --- risk routes ---
router.post("/risk/calculate", riskController.calculateRisk);
router.post("/risk/report", riskController.generateRiskReport);


//   // --- Quote routes ---
router.get("/quotes", quoteController.getQuotes);
router.post("/quotes", quoteController.createQuote);

//   // --- Scoring config routes ---
router.get("/config/score", configController.getScoringConfig);
router.patch("/config/score", configController.upsertScoringConfig);

export default router;