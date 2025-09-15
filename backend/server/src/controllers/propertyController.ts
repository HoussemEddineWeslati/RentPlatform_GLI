import type { Response } from "express";
import type { AuthRequest } from "../types/custom.js";
import { storage } from "../database/storage.js";
import { insertPropertySchema } from "../database/schema.js";

export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const properties = await storage.getProperties(req.session.userId!);
    res.json(properties);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const propertyData = insertPropertySchema.parse({
      ...req.body,
      userId: req.session.userId,
    });
    const property = await storage.createProperty(propertyData);
    res.json(property);
  } catch (err) {
    console.error("Create property error:", err);
    res.status(400).json({ message: "Invalid property data" });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await storage.updateProperty(id, req.body);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (err) {
    console.error("Update property error:", err);
    res.status(400).json({ message: "Failed to update property" });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteProperty(id);
    if (!success) return res.status(404).json({ message: "Property not found" });
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete property error:", err);
    res.status(500).json({ message: "Failed to delete property" });
  }
};
