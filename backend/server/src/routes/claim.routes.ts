import { Router } from "express";
import * as claimController from "../controllers/claimController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
// Protect all routes in this file, requiring a user to be logged in.
router.use(requireAuth);


// Retrieves a summary list of all claims filed by the logged-in user.
router.get("/", claimController.getAllClaims);
// Creates a new insurance claim against a policy.
router.post("/", claimController.createClaim);
// Fetches detailed information for a single claim by its ID.
router.get("/:id", claimController.getClaimById);
// Updates the status or notes of a specific claim (e.g., to 'approved').
router.patch("/:id", claimController.updateClaim);
// Deletes a specific claim.
router.delete("/:id", claimController.deleteClaim);


// Finds and returns all claims associated with a specific landlord's policies.
router.get("/landlord/:landlordId", claimController.getClaimsForLandlord);
// Finds and returns all claims filed against a specific policy.
router.get("/policy/:policyId", claimController.getClaimsForPolicy);
// Finds and returns all claims associated with a specific tenant.
router.get("/tenant/:tenantId", claimController.getClaimsForTenant);
// Generates and downloads the PDF document for a specific claim.
router.get("/:id/download", claimController.generateClaimDocument);
export default router;