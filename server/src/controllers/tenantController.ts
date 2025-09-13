import { Request, Response } from 'express';
import { storage } from "../database/storage.js";
import { insertTenantSchema } from "../database/schema.js";

export const getTenants = async (req: any, res: Response) => {
  try {
    const tenants = await storage.getTenants(req.session.userId);
    res.json(tenants);
  } catch (error) {
    console.error("Get tenants error:", error);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};

export const createTenant = async (req: any, res: Response) => {
  try {
    // Convert date strings to Date objects before validation
    const processedBody = {
      ...req.body,
      leaseStart: new Date(req.body.leaseStart),
      leaseEnd: new Date(req.body.leaseEnd),
      userId: req.session.userId
    };
    
    const tenantData = insertTenantSchema.parse(processedBody);
    
    const tenant = await storage.createTenant(tenantData);
    res.json(tenant);
  } catch (error) {
    console.error("Create tenant error:", error);
    res.status(400).json({ message: "Invalid tenant data" });
  }
};

export const updateTenant = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await storage.updateTenant(id, req.body);
    
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error("Update tenant error:", error);
    res.status(400).json({ message: "Failed to update tenant" });
  }
};

export const deleteTenant = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteTenant(id);
    
    if (!success) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    
    res.json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Delete tenant error:", error);
    res.status(500).json({ message: "Failed to delete tenant" });
  }
};