"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Flag } from "lucide-react";
import { AdminMetricStrip } from "@/components/admin/AdminMetricStrip";
import { ModerationReportCard } from "@/components/admin/ModerationReportCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { adminApi } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";

export default function AdminModerationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin-content-reports"],
    queryFn: () => adminApi.getContentReports(),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "resolved" | "dismissed" }) =>
      adminApi.resolveReport(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-reports"] });
      toast({ title: status === "resolved" ? "Report resolved" : "Report dismissed" });
    },
  });

  const pending = reports.filter((r) => r.status === "pending");
  const reviewed = reports.filter((r) => r.status !== "pending");

  const metrics = useMemo(
    () => [
      { label: "Pending", value: pending.length, color: "text-amber-600" },
      { label: "Resolved", value: reports.filter((r) => r.status === "resolved").length, color: "text-emerald-600" },
      { label: "Dismissed", value: reports.filter((r) => r.status === "dismissed").length, color: "text-muted-foreground" },
    ],
    [reports, pending.length]
  );

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Moderation"
        description="Review flagged content and user reports"
      />

      {reports.length > 0 && <AdminMetricStrip metrics={metrics} className="sm:grid-cols-3 lg:max-w-2xl" />}

      {reports.length === 0 ? (
        <EmptyState
          icon={<Flag className="h-10 w-10" />}
          title="No reports"
          description="Content reports from users will appear here for review."
        />
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Pending review</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {pending.map((report) => (
                  <ModerationReportCard
                    key={report.id}
                    report={report}
                    isLoading={resolveMutation.isPending}
                    onResolve={() =>
                      resolveMutation.mutate({ id: report.id, status: "resolved" })
                    }
                    onDismiss={() =>
                      resolveMutation.mutate({ id: report.id, status: "dismissed" })
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {reviewed.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">Reviewed</h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {reviewed.map((report) => (
                  <ModerationReportCard key={report.id} report={report} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
