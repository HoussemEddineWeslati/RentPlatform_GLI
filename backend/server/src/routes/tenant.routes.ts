import { Router } from "express";
import * as tenantController from "../controllers/tenantController.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);

router.get("/properties/:propertyId/tenants",tenantController.getTenantsByProperty);
router.get("/tenants", tenantController.getTenants);
router.post("/tenants", tenantController.createTenant);
router.patch("/tenants/:id", tenantController.updateTenant);
router.delete("/tenants/:id", tenantController.deleteTenant);

export default router;