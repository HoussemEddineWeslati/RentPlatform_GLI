import { Request, Response } from "express";
import { storage } from "../database/storage.js";
import { insertTenantSchema } from "../database/schema.js";
import type { AuthRequest } from "../types/custom.js";


export const getTenants = async (req: AuthRequest, res: Response) => {
  try {
    const tenants = await storage.getTenants(req.session.userId!);
    res.json(tenants);
  } catch (err) {
    console.error("Get tenants error:", err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenantData = insertTenantSchema.parse({
      ...req.body,
      userId: req.session.userId,
    });
    const tenant = await storage.createTenant(tenantData);
    res.json(tenant);
  } catch (err) {
    console.error("Create tenant error:", err);
    res.status(400).json({ message: "Invalid tenant data" });
  }
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await storage.updateTenant(id, req.body);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.json(tenant);
  } catch (err) {
    console.error("Update tenant error:", err);
    res.status(400).json({ message: "Failed to update tenant" });
  }
};

export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteTenant(id);
    if (!success) return res.status(404).json({ message: "Tenant not found" });
    res.json({ message: "Tenant deleted successfully" });
  } catch (err) {
    console.error("Delete tenant error:", err);
    res.status(500).json({ message: "Failed to delete tenant" });
  }
};
