// src/routes/policy.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as policyController from "../controllers/policyController.js";

const router = Router();

router.use(requireAuth);

// Retrieves a summary list of all policies managed by the logged-in user.
router.get("/", policyController.getAllPolicies);
// Creates a new insurance policy.
router.post("/", policyController.createPolicy);
// Fetches detailed information for a single policy by its ID.
router.get("/:id", policyController.getPolicyById);
// Updates the status of a specific policy (e.g., to 'active', 'expired').
router.patch("/:id/status", policyController.updatePolicyStatus);
// Deletes a specific policy. This will fail if the policy has claims.
router.delete("/:id", policyController.deletePolicy);

// Finds and returns all policies associated with a specific landlord.
router.get("/landlord/:landlordId", policyController.getPoliciesForLandlord);
// Finds and returns all policies associated with a specific tenant.
router.get("/tenant/:tenantId", policyController.getPoliciesForTenant);
// Generates and downloads the PDF document for a specific policy.
router.get("/:id/download", policyController.generatePolicyDocument);
export default router;