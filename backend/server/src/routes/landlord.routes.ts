// src/routes/landlord.routes.ts
import { Router } from "express";
import * as landlordController from "../controllers/landlordController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", landlordController.getLandlords);
router.post("/", landlordController.createLandlord);
router.get("/:id", landlordController.getLandlord);
router.patch("/:id", landlordController.updateLandlord);
router.delete("/:id", landlordController.deleteLandlord);
router.get("/:id/properties", landlordController.getLandlordProperties);
router.get("/:id/tenants", landlordController.getLandlordTenants);

export default router;