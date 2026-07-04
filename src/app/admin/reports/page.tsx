"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Download, FileBarChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminMetricStrip } from "@/components/admin/AdminMetricStrip";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { adminApi } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";
import { cn, formatDate } from "@/lib/utils";

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

  const quickMetrics = useMemo(() => {
    if (!students || !companies || !contactRequests || !jobs) return [];
    return [
      { label: "Students", value: students.total, color: "text-emerald-600" },
      { label: "Employers", value: companies.total, color: "text-sky-600" },
      { label: "Open jobs", value: jobs.open, color: "text-primary" },
      {
        label: "Acceptance rate",
        value: `${contactRequests.conversionRate}%`,
        color: "text-amber-600",
      },
    ];
  }, [students, companies, contactRequests, jobs]);

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rca-talent-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported" });
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
        <Button className="gap-2 rounded-full" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
      </PageHeader>

      <AdminMetricStrip metrics={quickMetrics} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={students.total}
          icon={<Users className="h-5 w-5" />}
          subtitle={`${students.approved} approved · ${students.pending} pending`}
        />
        <StatCard
          title="Total Employers"
          value={companies.total}
          subtitle={`${companies.approved} approved · ${companies.pending} pending`}
        />
        <StatCard
          title="Contact Requests"
          value={contactRequests.total}
          subtitle={`${contactRequests.conversionRate}% acceptance rate`}
        />
        <StatCard
          title="Open Jobs"
          value={jobs.open}
          icon={<FileBarChart className="h-5 w-5" />}
          subtitle={`${jobs.total} total postings`}
        />
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
