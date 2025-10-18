// src/services/claimPdfGenerator.ts
import PDFDocument from "pdfkit";
import { Writable } from "stream";
import type { Claim, Policy, Tenant } from "../database/schema.js";

// Type for the combined data object from storage.getClaimById
type ClaimReportData = {
    claim: Claim;
    policy: Policy;
    tenant: Tenant;
};

// Consistent styling
const BRAND_COLOR = "#0D47A1";
const TEXT_COLOR = "#333333";
const LIGHT_TEXT_COLOR = "#777777";
const FONT_NORMAL = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

export function generateClaimPDF(data: ClaimReportData, stream: Writable) {
    const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
            Title: `Claim Submission Summary - ${data.claim.claimNumber}`,
            Author: "GLI Pro Insurance",
        },
    });

    doc.pipe(stream);

    generateHeader(doc);
    generateClaimDetails(doc, data.claim, data.policy);
    generateClaimSummary(doc, data.claim);
    generateEvidenceAndNotes(doc, data.claim);
    generateFooter(doc);

    doc.end();
}

function generateHeader(doc: PDFKit.PDFDocument) {
    doc.save()
       .translate(50, 45)
       .path('M15 0 L0 6 L0 18 C0 27 6.4 35.4 15 39 C23.6 35.4 30 27 30 18 L30 6 Z')
       .fill(BRAND_COLOR)
       .restore();
    doc.fontSize(20).font(FONT_BOLD).fillColor(BRAND_COLOR).text("GLI Pro", 90, 50);
    doc.fontSize(10).font(FONT_NORMAL).fillColor(TEXT_COLOR).text("Guaranteed Rent Insurance", 90, 75);
    doc.moveDown(2);
}

// THIS FUNCTION CONTAINS THE FIX
function generateClaimDetails(doc: PDFKit.PDFDocument, claim: Claim, policy: Policy) {
    doc.fontSize(16).font(FONT_BOLD).text("Claim Submission Summary", { align: "center" });
    doc.moveDown(2);

    const startY = doc.y;
    // Claim Info
    doc.fontSize(11).font(FONT_BOLD).text("Claim Information", 50, startY);
    doc.fontSize(10).font(FONT_NORMAL);
    doc.text(`Claim Number: ${claim.claimNumber}`);

    // FIXED: Handle potential null value for createdAt
    const dateFiled = claim.createdAt ? new Date(claim.createdAt).toLocaleDateString('en-GB') : 'N/A';
    doc.text(`Date Filed: ${dateFiled}`);
    doc.font(FONT_BOLD).text(`Status: ${claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}`);

    // Policy Info
    doc.fontSize(11).font(FONT_BOLD).text("Associated Policy", 320, startY);
    doc.fontSize(10).font(FONT_NORMAL);
    doc.text(`Policy Number: ${policy.policyNumber}`, 320);
    
    // FIXED: Handle potential null values for policy start and end dates
    const startDate = policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-GB') : 'N/A';
    const endDate = policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-GB') : 'N/A';
    doc.text(`Effective Period: ${startDate} - ${endDate}`, 320);
    
    doc.moveDown(3);
}


function generateClaimSummary(doc: PDFKit.PDFDocument, claim: Claim) {
    generateSectionTitle(doc, "Claim Summary");
    const summary = {
        "Amount Requested": `$${parseFloat(claim.amountRequested).toFixed(2)}`,
        "Months of Unpaid Rent": String(claim.monthsOfUnpaidRent),
    };
    let startY = doc.y;
    Object.entries(summary).forEach(([key, value]) => {
        doc.fontSize(10).font(FONT_BOLD).text(key, 50, startY);
        doc.font(FONT_NORMAL).text(value, 200, startY);
        startY += 20;
    });
    doc.y = startY;
    doc.moveDown(3);
}

function generateEvidenceAndNotes(doc: PDFKit.PDFDocument, claim: Claim) {
    generateSectionTitle(doc, "Evidence & Notes");
    
    doc.fontSize(11).font(FONT_BOLD).text("Submitted Evidence:");
    doc.fontSize(10).font(FONT_NORMAL).fillColor(LIGHT_TEXT_COLOR);
    if (claim.evidenceLinks && claim.evidenceLinks.length > 0) {
        // Using doc.list is cleaner for bullet points
        doc.list(claim.evidenceLinks, { bulletRadius: 1.5 });
    } else {
        doc.text("No evidence links submitted.");
    }
    doc.moveDown(2);

    doc.fontSize(11).font(FONT_BOLD).fillColor(TEXT_COLOR).text("Adjuster Notes:");
    doc.fontSize(10).font(FONT_NORMAL);
    if (claim.notes) {
        doc.text(claim.notes, { align: "justify" });
    } else {
        doc.text("No notes have been added for this claim.");
    }
    doc.moveDown(3);
}

function generateFooter(doc: PDFKit.PDFDocument) {
    const pageBottom = doc.page.height - 40;
    doc.fontSize(8).font(FONT_NORMAL).fillColor(LIGHT_TEXT_COLOR);
    doc.text("GLI Pro Insurance © " + new Date().getFullYear(), 50, pageBottom, { align: 'left' });
    doc.text("This is an official record of the claim submission.", 50, pageBottom + 10, { align: 'left' });
}

function generateSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(12).font(FONT_BOLD).fillColor(BRAND_COLOR).text(title, 50, doc.y);
    doc.strokeColor(BRAND_COLOR).lineWidth(0.5).moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
    doc.y = doc.y + 25;
}