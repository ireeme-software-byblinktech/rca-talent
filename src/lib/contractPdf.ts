import { jsPDF } from "jspdf";
import { formatDate } from "@/lib/utils";
import type { ContractSignature, ContractWithDetails } from "@/types";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PRIMARY = [26, 43, 75] as const;

function formatSignedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function statusLabel(status: ContractWithDetails["status"]): string {
  const labels: Record<ContractWithDetails["status"], string> = {
    draft: "Draft",
    pending_student: "Awaiting student signature",
    pending_company: "Awaiting company signature",
    signed: "Fully signed",
    declined: "Declined",
    void: "Void",
  };
  return labels[status];
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = ensureSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(title.toUpperCase(), MARGIN, y);
  return y + 6;
}

function addWrappedText(doc: jsPDF, text: string, y: number, fontSize = 10): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(40, 40, 40);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  for (const line of lines) {
    y = ensureSpace(doc, y, fontSize * 0.5 + 2);
    doc.text(line, MARGIN, y);
    y += fontSize * 0.45 + 2;
  }
  return y + 4;
}

function addSignatureBlock(
  doc: jsPDF,
  label: string,
  signature: ContractSignature,
  y: number
): number {
  y = ensureSpace(doc, y, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(label.toUpperCase(), MARGIN, y);
  y += 5;

  const boxHeight = 28;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_WIDTH / 2 - 5, boxHeight);

  const isTyped =
    signature.method === "typed" || signature.signatureData.startsWith("typed:");
  const innerY = y + boxHeight / 2 + 2;

  if (isTyped) {
    const typedText = signature.signatureData.replace(/^typed:/, "") || signature.signerName;
    doc.setFont("times", "italic");
    doc.setFontSize(18);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(typedText, MARGIN + 8, innerY);
  } else {
    try {
      doc.addImage(
        signature.signatureData,
        "PNG",
        MARGIN + 6,
        y + 4,
        CONTENT_WIDTH / 2 - 17,
        boxHeight - 8
      );
    } catch {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.text(signature.signerName, MARGIN + 8, innerY);
    }
  }

  y += boxHeight + 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${signature.signerName} · ${formatSignedAt(signature.signedAt)}`, MARGIN, y);
  return y + 10;
}

export function buildContractPdf(contract: ContractWithDetails): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, PAGE_WIDTH, 32, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(contract.title, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  doc.text("RCA Talent · Employment Agreement", MARGIN, 24);

  y = 42;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Status: ${statusLabel(contract.status)}`, MARGIN, y);
  y += 10;

  const companyName = contract.company?.companyName ?? "Employer";
  const studentName = contract.student?.fullName ?? "Employee";
  y = addWrappedText(
    doc,
    `This agreement is between ${companyName} ("Employer") and ${studentName} ("Employee").`,
    y
  );

  y = addSectionTitle(doc, "Contract details", y);
  const details = [
    ["Role", contract.role],
    ["Start date", formatDate(contract.startDate)],
    ["Compensation", contract.compensation],
  ];
  doc.setFontSize(10);
  for (const [label, value] of details) {
    y = ensureSpace(doc, y, 8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(String(value), MARGIN + 38, y);
    y += 7;
  }
  y += 4;

  y = addSectionTitle(doc, "Terms & conditions", y);
  y = addWrappedText(doc, contract.terms, y);

  if (contract.companySignature || contract.studentSignature) {
    y = addSectionTitle(doc, "Digital signatures", y);
    if (contract.companySignature) {
      y = addSignatureBlock(doc, "Company signature", contract.companySignature, y);
    }
    if (contract.studentSignature) {
      y = addSignatureBlock(doc, "Student signature", contract.studentSignature, y);
    }
  } else if (contract.status === "draft" || contract.status === "pending_student") {
    y = addSectionTitle(doc, "Signatures", y);
    y = addWrappedText(
      doc,
      contract.status === "draft"
        ? "Awaiting company signature before sending to the employee."
        : "Awaiting employee signature to complete this agreement.",
      y
    );
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated ${formatSignedAt(new Date().toISOString())} · Page ${i} of ${pageCount}`,
      MARGIN,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text("RCA Talent Platform", PAGE_WIDTH - MARGIN, doc.internal.pageSize.getHeight() - 10, {
      align: "right",
    });
  }

  return doc;
}

export function getContractPdfFilename(contract: ContractWithDetails): string {
  const slug = contract.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${slug || "contract"}.pdf`;
}

export function getContractPdfBlob(contract: ContractWithDetails): Blob {
  const doc = buildContractPdf(contract);
  return doc.output("blob");
}

export function getContractPdfUrl(contract: ContractWithDetails): string {
  return URL.createObjectURL(getContractPdfBlob(contract));
}

export function downloadContractPdf(contract: ContractWithDetails): void {
  buildContractPdf(contract).save(getContractPdfFilename(contract));
}
