// src/controllers/policyController.ts
import type { Response } from "express";
import { storage } from "../database/storage.js";
import type { AuthRequest } from "../types/custom.js";
import { insertPolicySchema } from "../database/schema.js";
import { generatePolicyPDF } from "../services/policyPdfGenerator.js";
/**
 * Get all policies for the authenticated user.
 */
export const getAllPolicies = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const policies = await storage.getAllPolicies(userId);
        res.json({ success: true, data: policies });
    } catch (err) {
        console.error("Get all policies error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch policies." });
    }
};

/**
 * Get a single, detailed policy by its ID.
 */
export const getPolicyById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const policy = await storage.getPolicyById(id, userId);
        if (!policy) {
            return res.status(404).json({ success: false, message: "Policy not found or access denied." });
        }
        res.json({ success: true, data: policy });
    } catch (err) {
        console.error("Get policy by ID error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch policy." });
    }
};

/**
 * Get all policies for a specific landlord.
 */
export const getPoliciesForLandlord = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { landlordId } = req.params;
    const landlord = await storage.getLandlord(landlordId);
    if (!landlord || landlord.userId !== userId) {
        return res.status(404).json({ success: false, message: "Landlord not found or access denied." });
    }
    const policies = await storage.getPoliciesByLandlord(userId, landlordId);
    res.json({ success: true, data: policies });
  } catch (err) {
    console.error("Get policies by landlord error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch policies." });
  }
};

/**
 * Get all policies for a specific tenant.
 */
export const getPoliciesForTenant = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { tenantId } = req.params;
        const tenant = await storage.getTenant(tenantId);
        if (!tenant || tenant.userId !== userId) {
            return res.status(404).json({ success: false, message: "Tenant not found or access denied." });
        }
        const policies = await storage.getPoliciesByTenant(userId, tenantId);
        res.json({ success: true, data: policies });
    } catch (err) {
        console.error("Get policies by tenant error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch policies." });
    }
};

/**
 * Create a new policy.
 */
export const createPolicy = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const policyData = insertPolicySchema.parse({ ...req.body, userId });

    const [landlord, property, tenant] = await Promise.all([
        storage.getLandlord(policyData.landlordId),
        storage.getProperty(policyData.propertyId),
        storage.getTenant(policyData.tenantId),
    ]);
    if (!landlord || landlord.userId !== userId) return res.status(403).json({ success: false, message: "Invalid landlord." });
    if (!property || property.userId !== userId) return res.status(403).json({ success: false, message: "Invalid property." });
    if (!tenant || tenant.userId !== userId) return res.status(403).json({ success: false, message: "Invalid tenant." });
    
    const newPolicy = await storage.createPolicy(policyData);
    res.status(201).json({ success: true, data: newPolicy });
  } catch (err: any) {
    console.error("Create policy error:", err);
    res.status(400).json({ success: false, message: err.message || "Invalid policy data." });
  }
};

/**
 * Update the status of a policy.
 */
export const updatePolicyStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'expired', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status provided." });
        }
        const updatedPolicy = await storage.updatePolicy(id, userId, { status });
        if (!updatedPolicy) {
            return res.status(404).json({ success: false, message: "Policy not found or access denied." });
        }
        res.json({ success: true, data: updatedPolicy });
    } catch (err) {
        console.error("Update policy status error:", err);
        res.status(500).json({ success: false, message: "Failed to update policy." });
    }
};

/**
 * Delete a policy by its ID.
 */
export const deletePolicy = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const success = await storage.deletePolicy(id, userId);
        if (!success) {
            return res.status(404).json({ success: false, message: "Policy not found or access denied." });
        }
        res.json({ success: true, message: "Policy deleted successfully." });
    } catch (err: any) {
        console.error("Delete policy error:", err);
        // Handle specific error for policies with claims
        if (err.message.includes("active claims")) {
            return res.status(409).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Failed to delete policy." });
    }
};

/**
 * Generates and streams a PDF document for a specific policy.
 */
export const generatePolicyDocument = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const policyData = await storage.getPolicyById(id, userId);

        if (!policyData) {
            return res.status(404).json({ success: false, message: "Policy not found or access denied." });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="policy-${policyData.policy.policyNumber}.pdf"`);

        generatePolicyPDF(policyData, res);

    } catch (err: any) {
        console.error("Policy PDF generation error:", err);
        res.status(500).json({ success: false, message: "Failed to generate policy document." });
    }
};