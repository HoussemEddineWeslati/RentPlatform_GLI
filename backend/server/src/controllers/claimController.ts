// src/controllers/claimController.ts
import type { Response } from "express";
import { storage } from "../database/storage.js";
import type { AuthRequest } from "../types/custom.js";
import { insertClaimSchema } from "../database/schema.js";
import { generateClaimPDF } from "../services/claimPdfGenerator.js";
/**
 * Get all claims for the authenticated user.
 */
export const getAllClaims = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const claims = await storage.getAllClaims(userId);
        res.json({ success: true, data: claims });
    } catch (err) {
        console.error("Get all claims error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch claims." });
    }
};

/**
 * Get a single, detailed claim by its ID.
 */
export const getClaimById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const claim = await storage.getClaimById(id, userId);
        if (!claim) {
            return res.status(404).json({ success: false, message: "Claim not found or access denied." });
        }
        res.json({ success: true, data: claim });
    } catch (err) {
        console.error("Get claim by ID error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch claim." });
    }
};

/**
 * Get all claims for a specific landlord.
 */
export const getClaimsForLandlord = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const { landlordId } = req.params;
    const landlord = await storage.getLandlord(landlordId);
    if (!landlord || landlord.userId !== userId) {
        return res.status(404).json({ success: false, message: "Landlord not found or access denied." });
    }
    const claims = await storage.getClaimsByLandlord(userId, landlordId);
    res.json({ success: true, data: claims });
  } catch (err) {
    console.error("Get claims by landlord error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch claims." });
  }
};

/**
 * Get all claims associated with a specific policy.
 */
export const getClaimsForPolicy = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { policyId } = req.params;
        const policy = await storage.getPolicyById(policyId, userId);
        if (!policy) {
            return res.status(404).json({ success: false, message: "Policy not found or access denied." });
        }
        const claims = await storage.getClaimsByPolicy(userId, policyId);
        res.json({ success: true, data: claims });
    } catch (err) {
        console.error("Get claims by policy error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch claims." });
    }
};

/**
 * Get all claims associated with a specific tenant.
 */
export const getClaimsForTenant = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { tenantId } = req.params;
        const tenant = await storage.getTenant(tenantId);
        if (!tenant || tenant.userId !== userId) {
            return res.status(404).json({ success: false, message: "Tenant not found or access denied." });
        }
        const claims = await storage.getClaimsByTenant(userId, tenantId);
        res.json({ success: true, data: claims });
    } catch (err) {
        console.error("Get claims by tenant error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch claims." });
    }
};

/**
 * Create a new claim.
 */
export const createClaim = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.session.userId!;
    const claimData = insertClaimSchema.parse({ ...req.body, userId });

    const policy = await storage.getPolicyById(claimData.policyId, userId);
    if (!policy) {
        return res.status(403).json({ success: false, message: "Invalid policy or access denied." });
    }
    const newClaim = await storage.createClaim(claimData);
    res.status(201).json({ success: true, data: newClaim });
  } catch (err: any) {
    console.error("Create claim error:", err);
    res.status(400).json({ success: false, message: err.message || "Invalid claim data." });
  }
};

/**
 * Update a claim's status or notes.
 */
export const updateClaim = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const { status, notes } = req.body;
        const updateData: { status?: string, notes?: string } = {};

        if (status && ['pending', 'approved', 'rejected', 'paid'].includes(status)) {
            updateData.status = status;
        }
        if (notes && typeof notes === 'string') {
            updateData.notes = notes;
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No valid data provided for update." });
        }
        const updatedClaim = await storage.updateClaim(id, userId, updateData);
        if (!updatedClaim) {
            return res.status(404).json({ success: false, message: "Claim not found or access denied." });
        }
        res.json({ success: true, data: updatedClaim });
    } catch (err) {
        console.error("Update claim error:", err);
        res.status(500).json({ success: false, message: "Failed to update claim." });
    }
};

/**
 * Delete a claim by its ID.
 */
export const deleteClaim = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const success = await storage.deleteClaim(id, userId);
        if (!success) {
            return res.status(404).json({ success: false, message: "Claim not found or access denied." });
        }
        res.json({ success: true, message: "Claim deleted successfully." });
    } catch (err) {
        console.error("Delete claim error:", err);
        res.status(500).json({ success: false, message: "Failed to delete claim." });
    }
};

/**
 * Generates and streams a PDF document for a specific claim.
 */
export const generateClaimDocument = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.session.userId!;
        const { id } = req.params;
        const claimData = await storage.getClaimById(id, userId);

        if (!claimData) {
            return res.status(404).json({ success: false, message: "Claim not found or access denied." });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="claim-${claimData.claim.claimNumber}.pdf"`);
        
        generateClaimPDF(claimData, res);

    } catch (err: any) {
        console.error("Claim PDF generation error:", err);
        res.status(500).json({ success: false, message: "Failed to generate claim document." });
    }
};