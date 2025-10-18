import { Router } from "express";
import * as propertyController from "../controllers/propertyController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);


router.get("/",  propertyController.getProperties);
router.post("/", propertyController.createProperty);
router.patch("/:id",propertyController.updateProperty);
router.delete("/:id",propertyController.deleteProperty);

export default router;