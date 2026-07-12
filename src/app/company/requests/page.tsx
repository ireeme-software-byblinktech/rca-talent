"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContactRequestCard } from "@/components/shared/ContactRequestCard";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { contactRequestsApi } from "@/lib/api/contactRequests";
import { useAuth } from "@/lib/auth/context";
import { formatDate, cn } from "@/lib/utils";
import type { ContactRequestWithDetails } from "@/types";

export default function CompanyRequestsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["company-contact-requests", user?.id],
    queryFn: () => contactRequestsApi.getForCompany(user!.id),
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const stats = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "pending").length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      declined: requests.filter((r) => r.status === "declined").length,
    }),
    [requests]
  );

  const columns: Column<ContactRequestWithDetails>[] = [
    {
      key: "student",
      header: "Student",
      sortable: true,
      sortValue: (row) => row.student?.fullName ?? "",
      exportValue: (row) => row.student?.fullName ?? "",
      cell: (row) => (
        <div>
          <p className="font-semibold">{row.student?.fullName ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            Class of {row.student?.cohortYear ?? "—"}
          </p>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      exportValue: (row) => row.message,
      cell: (row) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
          {row.message}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => row.status,
      exportValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Sent",
      sortable: true,
      sortValue: (row) => row.createdAt,
      exportValue: (row) => formatDate(row.createdAt),
      cell: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (row) =>
        row.status === "accepted" && row.student ? (
          <span className="text-sm font-medium text-primary">
            {row.student.user.email}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "profile",
      header: "Profile",
      cell: (row) =>
        row.student ? (
          <Button variant="outline" size="sm" className="h-8 rounded-full" asChild>
            <Link href={`/company/students/${row.studentId}`}>View</Link>
          </Button>
        ) : null,
    },
  ];

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sent Requests"
        description="Track your outreach to students"
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <ViewToggle value={view} onChange={setView} />
        <Button className="rounded-full" asChild>
          <Link href="/company/search">
            <Send className="mr-2 h-4 w-4" />
            Find talent
          </Link>
        </Button>
      </PageHeader>

      {requests.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Awaiting reply", count: stats.pending, color: "text-amber-600" },
            { label: "Connected", count: stats.accepted, color: "text-emerald-600" },
            { label: "Declined", count: stats.declined, color: "text-muted-foreground" },
          ].map((s) => (
            <div
              key={s.label}
              className="fancy-card rounded-2xl border border-border/50 p-4 !translate-y-0 !shadow-card"
            >
              <p className={cn("text-sm font-medium", s.color)}>● {s.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-8 w-8" />}
          title={requests.length === 0 ? "No requests sent" : "No matching requests"}
          description={
            requests.length === 0
              ? "Search for talent and send contact requests to get started."
              : "Try changing the status filter."
          }
          action={
            requests.length === 0
              ? { label: "Find talent", onClick: () => window.location.href = "/company/search" }
              : undefined
          }
        />
      ) : view === "cards" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((req) => (
            <ContactRequestCard
              key={req.id}
              request={req}
              variant="outgoing"
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchable
          exportable
          searchPlaceholder="Search students or messages..."
        />
      )}
    </div>
  );
}
