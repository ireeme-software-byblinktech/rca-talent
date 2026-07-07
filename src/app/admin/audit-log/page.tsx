"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminMetricStrip } from "@/components/admin/AdminMetricStrip";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { adminApi } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils";
import type { AdminAuditLog } from "@/types";

const actionLabels: Record<string, string> = {
  approved_student: "Approved student",
  rejected_student: "Rejected student",
  approved_company: "Approved employer",
  rejected_company: "Rejected employer",
};

const actionVariants: Record<string, "approved" | "rejected" | "outline"> = {
  approved_student: "approved",
  rejected_student: "rejected",
  approved_company: "approved",
  rejected_company: "rejected",
};

export default function AdminAuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => adminApi.getAuditLogs({ pageSize: 50 }),
  });

  const logs = useMemo(() => data?.data ?? [], [data?.data]);

  const metrics = useMemo(
    () => [
      { label: "Total entries", value: logs.length, color: "text-primary" },
      {
        label: "Approvals",
        value: logs.filter((l) => l.action.includes("approved")).length,
        color: "text-emerald-600",
      },
      {
        label: "Rejections",
        value: logs.filter((l) => l.action.includes("rejected")).length,
        color: "text-rose-600",
      },
    ],
    [logs]
  );

  const columns: Column<AdminAuditLog>[] = [
    {
      key: "action",
      header: "Action",
      sortable: true,
      sortValue: (row) => row.action,
      exportValue: (row) => actionLabels[row.action] ?? row.action,
      cell: (row) => (
        <Badge variant={actionVariants[row.action] ?? "outline"} className="rounded-full">
          {actionLabels[row.action] ?? row.action}
        </Badge>
      ),
    },
    {
      key: "target",
      header: "Target",
      sortable: true,
      sortValue: (row) => row.targetId,
      exportValue: (row) => `${row.targetType}:${row.targetId}`,
      cell: (row) => (
        <div>
          <span className="text-sm font-medium capitalize">{row.targetType}</span>
          <p className="text-xs text-muted-foreground font-mono">{row.targetId}</p>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      exportValue: (row) => row.reason ?? "",
      cell: (row) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">
          {row.reason ?? "—"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (row) => row.createdAt,
      exportValue: (row) => formatDate(row.createdAt),
      cell: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Record of admin actions on the platform"
      />

      {!isLoading && logs.length > 0 && (
        <AdminMetricStrip metrics={metrics} className="sm:grid-cols-3 lg:max-w-2xl" />
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : logs.length === 0 ? (
        <div className="fancy-card rounded-2xl border border-border/50 p-12 text-center !translate-y-0 !shadow-card">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium">No audit log entries yet</p>
          <p className="text-sm text-muted-foreground">
            Admin actions will be recorded here automatically
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          searchable
          exportable
          searchPlaceholder="Search audit log..."
          emptyMessage="No audit log entries yet"
        />
      )}
    </div>
  );
}
