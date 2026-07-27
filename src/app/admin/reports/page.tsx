"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Download, FileBarChart, Users } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { adminApi } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";
import { cn, formatDate } from "@/lib/utils";

// ─── Report PDF constants ─────────────────────────────────────────────────────
const MARGIN = 14;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PRIMARY: [number, number, number] = [26, 43, 75];
const ROW_H = 9;
const COL_LABEL = MARGIN;
const COL_VALUE = PAGE_WIDTH - MARGIN;

function formatTs(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > doc.internal.pageSize.getHeight() - MARGIN) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

function addTableHeader(
  doc: jsPDF,
  y: number,
  cols: { label: string; x: number; w: number }[]
): number {
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(MARGIN, y, CONTENT_WIDTH, ROW_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  for (const col of cols) {
    doc.text(col.label, col.x + 2, y + 6);
  }
  return y + ROW_H;
}

function addTableRow(
  doc: jsPDF,
  y: number,
  cells: { text: string; x: number; w: number; color?: [number, number, number] }[],
  shade: boolean
): number {
  if (shade) {
    doc.setFillColor(245, 247, 250);
    doc.rect(MARGIN, y, CONTENT_WIDTH, ROW_H, "F");
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  for (const cell of cells) {
    doc.setTextColor(...(cell.color ?? ([40, 40, 40] as [number, number, number])));
    doc.text(cell.text, cell.x + 2, y + 6);
  }
  return y + ROW_H;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReportPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fancy-card rounded-2xl border border-border/50 overflow-hidden !translate-y-0 !shadow-card",
        className
      )}
    >
      <div className="border-b border-border/50 bg-muted/20 px-5 py-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3 p-5 text-sm">{children}</div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/20 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const { toast } = useToast();

  const { data: report, isLoading } = useQuery({
    queryKey: ["admin-platform-report"],
    queryFn: () => adminApi.getPlatformReport(),
  });

  const students = report?.students as
    | { total: number; approved: number; pending: number }
    | undefined;
  const companies = report?.companies as
    | { total: number; approved: number; pending: number }
    | undefined;
  const contactRequests = report?.contactRequests as
    | { total: number; accepted: number; conversionRate: number }
    | undefined;
  const jobs = report?.jobs as { total: number; open: number } | undefined;

  const statCards = useMemo(() => {
    if (!students || !companies || !contactRequests || !jobs) return [];
    return [
      {
        title: "Total Students",
        value: students.total,
        icon: <Users className="h-5 w-5" />,
        subtitle: `${students.approved} approved · ${students.pending} pending`,
      },
      {
        title: "Total Employers",
        value: companies.total,
        subtitle: `${companies.approved} approved · ${companies.pending} pending`,
      },
      {
        title: "Contact Requests",
        value: contactRequests.total,
        subtitle: `${contactRequests.conversionRate}% acceptance rate`,
      },
      {
        title: "Open Jobs",
        value: jobs.open,
        icon: <FileBarChart className="h-5 w-5" />,
        subtitle: `${jobs.total} total postings`,
      },
    ];
  }, [students, companies, contactRequests, jobs]);

  // ─── PDF export ──────────────────────────────────────────────────────────────
  const handleExportPdf = () => {
    if (!report || !students || !companies || !contactRequests || !jobs) return;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const generatedLabel = formatTs(
      (report.generatedAt as string) ?? new Date().toISOString()
    );
    const studentApprovalRate = students.total
      ? Math.round((students.approved / students.total) * 100)
      : 0;
    const employerApprovalRate = companies.total
      ? Math.round((companies.approved / companies.total) * 100)
      : 0;

    // ── Header banner ────────────────────────────────────────────────────────
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.rect(0, 0, PAGE_WIDTH, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("RCA — Platform Report", MARGIN, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 230);
    doc.text(`Generated: ${generatedLabel}`, MARGIN, 23);

    let y = 40;

    // ── Platform Overview table ──────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text("Platform Overview", MARGIN, y);
    y += 5;

    const overviewCols = [
      { label: "Metric", x: COL_LABEL, w: CONTENT_WIDTH * 0.65 },
      { label: "Value", x: MARGIN + CONTENT_WIDTH * 0.65, w: CONTENT_WIDTH * 0.35 },
    ];
    y = addTableHeader(doc, y, overviewCols);

    const overviewRows = [
      ["Total Students", String(students.total)],
      ["Students Approved", String(students.approved)],
      ["Students Pending", String(students.pending)],
      ["Student Approval Rate", `${studentApprovalRate}%`],
      ["Total Employers", String(companies.total)],
      ["Employers Approved", String(companies.approved)],
      ["Employers Pending", String(companies.pending)],
      ["Employer Approval Rate", `${employerApprovalRate}%`],
      ["Open Jobs", String(jobs.open)],
      ["Total Job Postings", String(jobs.total)],
      ["Total Contact Requests", String(contactRequests.total)],
      ["Accepted Contact Requests", String(contactRequests.accepted)],
      ["Contact Acceptance Rate", `${contactRequests.conversionRate}%`],
    ];

    overviewRows.forEach(([label, value], idx) => {
      y = ensureSpace(doc, y, ROW_H + 1);
      y = addTableRow(
        doc,
        y,
        [
          { text: label, x: overviewCols[0].x, w: overviewCols[0].w },
          { text: value, x: overviewCols[1].x, w: overviewCols[1].w },
        ],
        idx % 2 === 0
      );
    });

    y += 10;

    // ── Engagement table ─────────────────────────────────────────────────────
    y = ensureSpace(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text("Engagement", MARGIN, y);
    y += 5;

    y = addTableHeader(doc, y, overviewCols);

    const engagementRows = [
      ["Accepted contact requests", String(contactRequests.accepted)],
      ["Interview invitations", String(report.interviews as number)],
      ["Messages sent", String(report.messages as number)],
      ["Pending moderation", String(report.moderationPending as number)],
    ];

    engagementRows.forEach(([label, value], idx) => {
      y = ensureSpace(doc, y, ROW_H + 1);
      y = addTableRow(
        doc,
        y,
        [
          { text: label, x: overviewCols[0].x, w: overviewCols[0].w },
          { text: value, x: overviewCols[1].x, w: overviewCols[1].w },
        ],
        idx % 2 === 0
      );
    });

    y += 10;

    // ── Verification Summary table ────────────────────────────────────────────
    y = ensureSpace(doc, y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text("Verification Summary", MARGIN, y);
    y += 5;

    y = addTableHeader(doc, y, overviewCols);

    const verificationRows = [
      ["Students pending review", String(students.pending)],
      ["Employers pending review", String(companies.pending)],
      ["Student approval rate", `${studentApprovalRate}%`],
      ["Employer approval rate", `${employerApprovalRate}%`],
    ];

    verificationRows.forEach(([label, value], idx) => {
      y = ensureSpace(doc, y, ROW_H + 1);
      y = addTableRow(
        doc,
        y,
        [
          { text: label, x: overviewCols[0].x, w: overviewCols[0].w },
          { text: value, x: overviewCols[1].x, w: overviewCols[1].w },
        ],
        idx % 2 === 0
      );
    });

    // ── Footer on every page ─────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pageH = doc.internal.pageSize.getHeight();
      doc.text(
        `Page ${i} of ${pageCount} — RCA Talent Management System`,
        MARGIN,
        pageH - 8
      );
      doc.text(generatedLabel, COL_VALUE, pageH - 8, { align: "right" });
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`rca-talent-report-${dateStr}.pdf`);
    toast({ title: "Report exported as PDF" });
  };

  if (isLoading || !report || !students || !companies || !contactRequests || !jobs) {
    return <LoadingSkeleton rows={6} />;
  }

  const studentApprovalRate = students.total
    ? Math.round((students.approved / students.total) * 100)
    : 0;
  const employerApprovalRate = companies.total
    ? Math.round((companies.approved / companies.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports & Statistics"
        description={`Platform snapshot generated ${formatDate(report.generatedAt as string)}`}
      >
        <Button className="gap-2 rounded-full" onClick={handleExportPdf}>
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </PageHeader>

      {/* Single row of stat cards — no duplicate quick-metric strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            subtitle={card.subtitle}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ReportPanel title="Engagement">
          <ReportRow label="Accepted contact requests" value={contactRequests.accepted} />
          <ReportRow label="Interview invitations" value={report.interviews as number} />
          <ReportRow label="Messages sent" value={report.messages as number} />
          <ReportRow label="Pending moderation" value={report.moderationPending as number} />
        </ReportPanel>

        <ReportPanel title="Verification Summary">
          <ReportRow label="Students pending review" value={students.pending} />
          <ReportRow label="Employers pending review" value={companies.pending} />
          <ReportRow label="Student approval rate" value={`${studentApprovalRate}%`} />
          <ReportRow label="Employer approval rate" value={`${employerApprovalRate}%`} />
        </ReportPanel>
      </div>
    </div>
  );
}
