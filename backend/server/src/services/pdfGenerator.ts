// src/services/pdfGenerator.ts

import PDFDocument from "pdfkit";
import { Writable } from "stream";
import type { RiskReportRequest } from "../validators/riskSchema.js";

// Type for the risk calculation result
type RiskResult = {
    safetyScore: number;
    PD_12m: number;
    decision: "accept" | "conditional_accept" | "decline";
    components: Record<string, number>;
    explanations: string[];
};

// Colors and fonts for a professional look
const BRAND_COLOR = "#0D47A1"; // A deep blue
const TEXT_COLOR = "#333333";
const LIGHT_TEXT_COLOR = "#777777";
const FONT_NORMAL = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

export function generateRiskReportPDF(
    reportData: RiskReportRequest,
    riskResult: RiskResult,
    stream: Writable
) {
    const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
            Title: "Tenant Risk Assessment Report",
            Author: "SafeRent Insurance Company",
        },
    });

    doc.pipe(stream);

    generateHeader(doc);
    generateReportDetails(doc, reportData);
    generateTenantAndPropertyInfo(doc, reportData);
    generateRiskSummary(doc, riskResult);
    generateRiskFactorsBreakdown(doc, riskResult);
    generateConclusion(doc, riskResult);
    generateFooter(doc);

    doc.end();
}

function generateHeader(doc: PDFKit.PDFDocument) {
    // Logo: A shield with "GLI Pro"
    doc.save()
        .translate(50, 45)
        .path('M15 0 L0 6 L0 18 C0 27 6.4 35.4 15 39 C23.6 35.4 30 27 30 18 L30 6 Z')
        .fill(BRAND_COLOR)
        .restore();

    doc.fontSize(20)
        .font(FONT_BOLD)
        .fillColor(BRAND_COLOR)
        .text("GLI Pro", 90, 50);

    doc.fontSize(10)
        .font(FONT_NORMAL)
        .fillColor(TEXT_COLOR)
        .text("SafeRent Insurance Company", 90, 75);

    doc.moveDown(2);
}

function generateReportDetails(doc: PDFKit.PDFDocument, data: RiskReportRequest) {
    const reportId = `RISK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    doc.fontSize(16)
        .font(FONT_BOLD)
        .text("Tenant Risk Assessment Report", { align: "center" });

    doc.moveDown(0.5);

    doc.fontSize(10)
        .font(FONT_NORMAL)
        .fillColor(LIGHT_TEXT_COLOR)
        .text(`Report ID: ${reportId}`, { align: "center" })
        .text(`Date: ${reportDate}`, { align: "center" });

    doc.moveDown(3);
}

function generateTenantAndPropertyInfo(doc: PDFKit.PDFDocument, data: RiskReportRequest) {
    const startY = doc.y;

    // Property Information Column
    doc.fontSize(12).font(FONT_BOLD).text("Property Information", 50, startY);
    doc.moveDown(0.5);
    doc.fontSize(10).font(FONT_NORMAL);
    doc.text(`Address: ${data.propertyAddress || 'N/A'}`);
    doc.text(`City: ${data.propertyCity || 'N/A'}`);
    doc.text(`Type: ${data.propertyType || 'N/A'}`);
    doc.text(`Monthly Rent: €${data.rentAmount?.toFixed(2) ?? 'N/A'}`);

    // Tenant Information Column
    doc.fontSize(12).font(FONT_BOLD).text("Tenant Information", 320, startY);
    doc.moveDown(0.5);
    doc.fontSize(10).font(FONT_NORMAL);
    doc.text(`Full Name: ${data.fullName || 'N/A'}`, 320);
    doc.text(`Email: ${data.tenantEmail || 'N/A'}`, 320);
    doc.text(`Phone: ${data.tenantPhone || 'N/A'}`, 320);
    doc.text(`Employment: ${data.employmentType || 'N/A'}`, 320);
    doc.text(`Net Salary: €${data.monthlyNetSalary?.toFixed(2) ?? 'N/A'}`, 320);

    if (data.leaseStartDate && data.leaseEndDate) {
        const start = new Date(data.leaseStartDate).toLocaleDateString('en-GB');
        const end = new Date(data.leaseEndDate).toLocaleDateString('en-GB');
        doc.text(`Lease Period: ${start} → ${end}`, 320);
    }

    doc.moveDown(3);
}


function getRiskLevel(score: number): { level: "Low" | "Medium" | "High"; color: string } {
    if (score > 75) return { level: "Low", color: "#4CAF50" }; // Green
    if (score > 50) return { level: "Medium", color: "#FFC107" }; // Amber
    return { level: "High", color: "#F44336" }; // Red
}

function generateRiskSummary(doc: PDFKit.PDFDocument, result: RiskResult) {
    generateSectionTitle(doc, "Risk Calculation Summary");

    const { level, color } = getRiskLevel(result.safetyScore);
    const decisionText = result.decision === "accept" ? "Approved" : result.decision === "conditional_accept" ? "Approved (Conditional)" : "Declined";

    const summaryData = [
        ["Risk Score:", `${result.safetyScore.toFixed(0)} / 100`],
        ["Risk Level:", level],
        ["Decision:", decisionText],
    ];

    let startY = doc.y;
    summaryData.forEach(([label, value]) => {
        doc.font(FONT_BOLD).text(label, 50, startY);
        if (label === "Risk Level:") {
            doc.font(FONT_BOLD).fillColor(color).text(value, 150, startY);
        } else {
            doc.font(FONT_NORMAL).fillColor(TEXT_COLOR).text(value, 150, startY);
        }
        startY += 20;
    });

    doc.y = startY;
    doc.moveDown(3);
}

function generateRiskFactorsBreakdown(doc: PDFKit.PDFDocument, result: RiskResult) {
    generateSectionTitle(doc, "Risk Factors Breakdown");

    const tableTop = doc.y;
    const itemX = 50;
    const scoreX = 250;
    const maxScoreX = 350;

    // Table Header
    doc.font(FONT_BOLD)
        .text("Category", itemX, tableTop)
        .text("Score", scoreX, tableTop, { width: 90, align: 'center' })
        .text("Max Score", maxScoreX, tableTop, { width: 90, align: 'center' });
    doc.moveDown();

    const tableData = [
        // ✅ SAFEGUARD: Use `?? 0` to default to 0 if a score is undefined
        { category: "Personal Information", score: result.components.personal ?? 0, max: 10 },
        { category: "Employment & Income", score: result.components.employment ?? 0, max: 25 },
        { category: "Financial Obligations", score: result.components.financial ?? 0, max: 20 },
        { category: "Housing & Rental History", score: result.components.housing ?? 0, max: 25 },
        { category: "Other Factors", score: result.components.other ?? 0, max: 20 },
    ];

    tableData.forEach(({ category, score, max }) => {
        const y = doc.y;
        doc.font(FONT_NORMAL).fontSize(10)
            .text(category, itemX, y)
            .text(score.toFixed(1), scoreX, y, { width: 90, align: 'center' })
            .text(String(max), maxScoreX, y, { width: 90, align: 'center' });
        doc.moveDown();
    });

    doc.moveDown(2);
}

function generateConclusion(doc: PDFKit.PDFDocument, result: RiskResult) {
    generateSectionTitle(doc, "Conclusion");
    doc.fontSize(10).font(FONT_NORMAL).fillColor(TEXT_COLOR);

    const conclusionText = result.explanations.join(" ");
    const decisionText =
        result.decision === "accept"
            ? "Approved, subject to standard coverage conditions."
            : result.decision === "conditional_accept"
            ? "Approved, subject to additional checks or a higher premium."
            : "Declined, as the risk profile does not meet our underwriting criteria.";

    // ✅ Force full-width justified paragraph
    doc.text(
        `Based on the risk assessment, the tenant is evaluated with a score of ${result.safetyScore.toFixed(
            0
        )}. ${conclusionText}`,
        50,                // X (left margin)
        doc.y,             // Y (current cursor)
        {
            width: 500,    // ensure it spans most of the page
            align: "justify",
        }
    );

    doc.moveDown();

    // ✅ Decision text bold, full width
    doc.font(FONT_BOLD)
        .fillColor(TEXT_COLOR)
        .text(`The application is ${decisionText}`, 50, doc.y, {
            width: 500,
            align: "justify",
        });

    doc.moveDown(3);
}


function generateFooter(doc: PDFKit.PDFDocument) {
    const range = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc.fontSize(8)
        .font(FONT_NORMAL)
        .fillColor(LIGHT_TEXT_COLOR)
        .text("SafeRent Insurance Company © " + new Date().getFullYear(),
            50,
            doc.page.height - 40,
            { align: 'left', width: 500 }
        );

    doc.text("This report is confidential and intended for underwriting purposes only.",
        50,
        doc.page.height - 30,
        { align: 'left', width: 500 }
    );
    
    doc.text("Contact: support@saferent.com | +216 70 000 000",
        50,
        doc.page.height - 40,
        { align: 'right', width: 500 }
    );
    
    doc.page.margins.bottom = range;
}

// Helper for consistent section titles
function generateSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(12)
        .font(FONT_BOLD)
        .fillColor(BRAND_COLOR)
        .text(title);

    doc.strokeColor(BRAND_COLOR)
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
        
    doc.moveDown(1.5);
}