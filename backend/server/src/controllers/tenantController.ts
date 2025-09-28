import type { Response } from "express";
import type { AuthRequest } from "../types/custom.js";
import { storage } from "../database/storage.js";
import { insertTenantSchema } from "../database/schema.js";

/**
 * GET /api/tenants
 * If landlordId query param is provided, return tenants scoped to that landlord.
 * Otherwise return all tenants for the authenticated user (insurer).
 */
export const getTenants = async (req: AuthRequest, res: Response) => {
  try {
    const landlordId = req.query.landlordId as string | undefined;

    if (landlordId) {
      const landlord = await storage.getLandlord(landlordId);
      if (!landlord) return res.status(404).json({ message: "Landlord not found" });
      if (landlord.userId !== req.session.userId) return res.status(403).json({ message: "Forbidden" });

      const tenants = await storage.getTenantsByLandlord(landlordId);
      return res.json(tenants);
    }

    const tenants = await storage.getTenants(req.session.userId!);
    res.json(tenants);
  } catch (err) {
    console.error("Get tenants error:", err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};

/**
 * POST /api/tenants
 * Create new tenant linked to a property
 */
export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenantData = insertTenantSchema.parse({
      ...req.body,
      userId: req.session.userId,
    });

    // Check property tenant limit
    const property = await storage.getProperty(tenantData.propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });
    if ((property.currentTenants ?? 0) >= (property.maxTenants ?? 1)) {
      return res.status(400).json({ message: "Maximum tenants reached for this property" });
    }

    const tenant = await storage.createTenant(tenantData);

    // Update property: increment currentTenants, update status if needed
    const newCurrent = (property.currentTenants ?? 0) + 1;
    let newStatus = property.status;
    if (newCurrent >= (property.maxTenants ?? 1)) {
      newStatus = "rented";
    } else if (newCurrent > 0) {
      newStatus = "rented";
    }
    await storage.updateProperty(property.id, {
      currentTenants: newCurrent,
      status: newStatus,
    });

    res.status(201).json(tenant);
  } catch (err) {
    console.error("Create tenant error:", err);
    res.status(400).json({ message: "Invalid tenant data" });
  }
};


/**
 * PATCH /api/tenants/:id
 * Update tenant info
 */
export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingTenant = await storage.getTenant(id);
    if (!existingTenant) return res.status(404).json({ message: "Tenant not found" });

    const updatedTenant = await storage.updateTenant(id, req.body);
    if (!updatedTenant) return res.status(404).json({ message: "Tenant not found" });

    // If propertyId changed, update counts/status on both properties
    if (req.body.propertyId && req.body.propertyId !== existingTenant.propertyId) {
      // Decrement old property
      const oldProperty = await storage.getProperty(existingTenant.propertyId);
      if (oldProperty) {
        const newCurrent = Math.max((oldProperty.currentTenants ?? 1) - 1, 0);
        let newStatus = oldProperty.status;
        if (newCurrent === 0) {
          newStatus = "available";
        } else if (newCurrent < (oldProperty.maxTenants ?? 1)) {
          newStatus = "rented";
        }
        await storage.updateProperty(oldProperty.id, {
          currentTenants: newCurrent,
          status: newStatus,
        });
      }
      // Increment new property
      const newProperty = await storage.getProperty(req.body.propertyId);
      if (newProperty) {
        const newCurrent = (newProperty.currentTenants ?? 0) + 1;
        let newStatus = newProperty.status;
        if (newCurrent >= (newProperty.maxTenants ?? 1)) {
          newStatus = "rented";
        } else if (newCurrent > 0) {
          newStatus = "rented";
        }
        await storage.updateProperty(newProperty.id, {
          currentTenants: newCurrent,
          status: newStatus,
        });
      }
    }

    res.json(updatedTenant);
  } catch (err) {
    console.error("Update tenant error:", err);
    res.status(400).json({ message: "Failed to update tenant" });
  }
};

/**
 * DELETE /api/tenants/:id
 * Remove tenant
 */
export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await storage.getTenant(id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const success = await storage.deleteTenant(id);
    if (!success) return res.status(404).json({ message: "Tenant not found" });

    // Update property: decrement currentTenants, update status if needed
    const property = await storage.getProperty(tenant.propertyId);
    if (property) {
      const newCurrent = Math.max((property.currentTenants ?? 1) - 1, 0);
      let newStatus = property.status;
      if (newCurrent === 0) {
        newStatus = "available";
      } else if (newCurrent < (property.maxTenants ?? 1)) {
        newStatus = "rented";
      }
      await storage.updateProperty(property.id, {
        currentTenants: newCurrent,
        status: newStatus,
      });
    }

    res.json({ message: "Tenant deleted successfully" });
  } catch (err) {
    console.error("Delete tenant error:", err);
    res.status(500).json({ message: "Failed to delete tenant" });
  }
};


export const getTenantsByProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const property = await storage.getProperty(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });
    if (property.userId !== req.session.userId)
      return res.status(403).json({ message: "Forbidden" });

    const tenants = await storage.getTenantsByProperty(propertyId);
    res.json(tenants);
  } catch (err) {
    console.error("Get tenants by property error:", err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};