// src/services/policyPdfGenerator.ts
import PDFDocument from "pdfkit";
import { Writable } from "stream";
import type { Landlord, Policy, Property, Tenant } from "../database/schema.js";

// Type for the combined data object from storage.getPolicyById
type PolicyReportData = {
    policy: Policy;
    landlord: Landlord;
    property: Property;
    tenant: Tenant;
};

// Consistent styling from your existing generator
const BRAND_COLOR = "#0D47A1";
const TEXT_COLOR = "#333333";
const LIGHT_TEXT_COLOR = "#777777";
const FONT_NORMAL = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

export function generatePolicyPDF(data: PolicyReportData, stream: Writable) {
    const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
            Title: `Insurance Policy Certificate - ${data.policy.policyNumber}`,
            Author: "GLI Pro Insurance",
        },
    });

    doc.pipe(stream);

    generateHeader(doc);
    generatePolicyDetails(doc, data.policy);
    generatePartiesInfo(doc, data.landlord, data.tenant);
    generatePropertyInfo(doc, data.property);
    generateCoverageSummary(doc, data.policy, data.property);
    generateTerms(doc);
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

function generatePolicyDetails(doc: PDFKit.PDFDocument, policy: Policy) {
    doc.fontSize(16).font(FONT_BOLD).text("Insurance Policy Certificate", { align: "center" });
    doc.moveDown(2);

    const details = {
        "Policy Number": policy.policyNumber,
        "Policy Status": policy.status.charAt(0).toUpperCase() + policy.status.slice(1),
        "Effective Date": new Date(policy.startDate).toLocaleDateString('en-GB'),
        "Expiration Date": new Date(policy.endDate).toLocaleDateString('en-GB'),
    };

    let startY = doc.y;
    Object.entries(details).forEach(([key, value]) => {
        doc.fontSize(10).font(FONT_BOLD).text(key, 50, startY);
        doc.font(FONT_NORMAL).text(value, 170, startY);
        startY += 20;
    });
    doc.y = startY;
    doc.moveDown(2);
}

function generatePartiesInfo(doc: PDFKit.PDFDocument, landlord: Landlord, tenant: Tenant) {
    const startY = doc.y;
    // Landlord Column
    generateSectionTitle(doc, "Parties Involved", startY);
    doc.fontSize(11).font(FONT_BOLD).text("Insured Landlord", 50, doc.y);
    doc.fontSize(10).font(FONT_NORMAL);
    doc.text(landlord.name);
    doc.text(landlord.email);
    doc.text(landlord.phone);

    // Tenant Column
    doc.fontSize(11).font(FONT_BOLD).text("Covered Tenant", 320, doc.y - 48);
    doc.fontSize(10).font(FONT_NORMAL);
    doc.text(tenant.name, 320);
    doc.text(tenant.email, 320);
    doc.moveDown(3);
}

function generatePropertyInfo(doc: PDFKit.PDFDocument, property: Property) {
    generateSectionTitle(doc, "Covered Property");
    doc.fontSize(10).font(FONT_NORMAL);
    doc.text(`Address: ${property.address}, ${property.city}`);
    doc.text(`Property Type: ${property.type}`);
    doc.text(`Monthly Rent: $${parseFloat(property.rentAmount).toFixed(2)}`);
    doc.moveDown(3);
}

function generateCoverageSummary(doc: PDFKit.PDFDocument, policy: Policy, property: Property) {
    generateSectionTitle(doc, "Coverage Summary");
    const totalCoverage = parseFloat(property.rentAmount) * policy.coverageMonths;
    const summary = {
        "Coverage Type": "Guaranteed Rent",
        "Total Premium": `$${parseFloat(policy.premiumAmount).toFixed(2)}`,
        "Coverage Limit": `$${totalCoverage.toFixed(2)} (${policy.coverageMonths} months of rent)`,
        "Risk Score Applied": policy.riskScore,
    };
    let startY = doc.y;
    Object.entries(summary).forEach(([key, value]) => {
        doc.fontSize(10).font(FONT_BOLD).text(key, 50, startY);
        doc.font(FONT_NORMAL).text(String(value), 200, startY);
        startY += 20;
    });
    doc.y = startY;
    doc.moveDown(3);
}

function generateTerms(doc: PDFKit.PDFDocument) {
    generateSectionTitle(doc, "Key Terms & Conditions");
    doc.fontSize(8).font(FONT_NORMAL).fillColor(LIGHT_TEXT_COLOR);
    const terms = "This document confirms that the above-named tenant and property are covered under a Guaranteed Rent Insurance policy issued by GLI Pro. This policy covers unpaid rent up to the coverage limit specified, subject to the full terms, conditions, and exclusions detailed in the official policy wording. The insured must adhere to all claim procedures and provide necessary documentation. This certificate is for summary purposes only and does not override the master policy document.";
    doc.text(terms, { align: "justify" });
    doc.moveDown(3);
}

function generateFooter(doc: PDFKit.PDFDocument) {
    const pageBottom = doc.page.height - 40;
    doc.fontSize(8).font(FONT_NORMAL).fillColor(LIGHT_TEXT_COLOR);
    doc.text("GLI Pro Insurance © " + new Date().getFullYear(), 50, pageBottom, { align: 'left' });
    doc.text("Contact: support@glipro.com | +216 70 000 000", 50, pageBottom, { align: 'right' });
}

function generateSectionTitle(doc: PDFKit.PDFDocument, title: string, y?: number) {
    const startY = y ?? doc.y;
    doc.fontSize(12).font(FONT_BOLD).fillColor(BRAND_COLOR).text(title, 50, startY);
    doc.strokeColor(BRAND_COLOR).lineWidth(0.5).moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();
    doc.y = startY + 25;
}