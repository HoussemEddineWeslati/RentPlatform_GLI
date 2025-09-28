import type { Response } from "express";
import type { AuthRequest } from "../types/custom.js";
import { storage } from "../database/storage.js";
import { insertLandlordSchema } from "../database/schema.js";

/**
 * GET /api/landlords
 * Returns all landlords that belong to the authenticated user (insurer).
 */
export const getLandlords = async (req: AuthRequest, res: Response) => {
  try {
    const landlords = await storage.getLandlords(req.session.userId!);
    res.json(landlords);
  } catch (err) {
    console.error("Get landlords error:", err);
    res.status(500).json({ message: "Failed to fetch landlords" });
  }
};

export const getLandlord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const landlord = await storage.getLandlord(id);
    if (!landlord) return res.status(404).json({ message: "Landlord not found" });
    // ensure landlord belongs to current user
    if (landlord.userId !== req.session.userId) return res.status(403).json({ message: "Forbidden" });
    res.json(landlord);
  } catch (err) {
    console.error("Get landlord error:", err);
    res.status(500).json({ message: "Failed to fetch landlord" });
  }
};

export const createLandlord = async (req: AuthRequest, res: Response) => {
  try {
    const payload = insertLandlordSchema.parse({
      ...req.body,
      userId: req.session.userId,
    });
    const landlord = await storage.createLandlord(payload);
    res.status(201).json(landlord);
  } catch (err) {
    console.error("Create landlord error:", err);
    res.status(400).json({ message: "Invalid landlord data" });
  }
};

export const updateLandlord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await storage.getLandlord(id);
    if (!existing) return res.status(404).json({ message: "Landlord not found" });
    if (existing.userId !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

    const landlord = await storage.updateLandlord(id, req.body);
    res.json(landlord);
  } catch (err) {
    console.error("Update landlord error:", err);
    res.status(400).json({ message: "Failed to update landlord" });
  }
};

export const deleteLandlord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await storage.getLandlord(id);
    if (!existing) return res.status(404).json({ message: "Landlord not found" });
    if (existing.userId !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

    const success = await storage.deleteLandlord(id);
    if (!success) return res.status(500).json({ message: "Failed to delete landlord" });
    res.json({ message: "Landlord deleted successfully" });
  } catch (err) {
    console.error("Delete landlord error:", err);
    res.status(500).json({ message: "Failed to delete landlord" });
  }
};

/**
 * GET /api/landlords/:id/properties
 * List properties for this landlord (must belong to same insurer).
 */
export const getLandlordProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const landlord = await storage.getLandlord(id);
    if (!landlord) return res.status(404).json({ message: "Landlord not found" });
    if (landlord.userId !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

    const properties = await storage.getPropertiesByLandlord(id);
    res.json(properties);
  } catch (err) {
    console.error("Get landlord properties error:", err);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

/**
 * GET /api/landlords/:id/tenants
 * List tenants for this landlord (tenants in properties owned by the landlord)
 */
export const getLandlordTenants = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const landlord = await storage.getLandlord(id);
    if (!landlord) return res.status(404).json({ message: "Landlord not found" });
    if (landlord.userId !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

    const tenants = await storage.getTenantsByLandlord(id);
    res.json(tenants);
  } catch (err) {
    console.error("Get landlord tenants error:", err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};
