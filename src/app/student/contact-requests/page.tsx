"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Mail, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { formatDate, cn } from "@/lib/utils";
import type { ContactRequestWithDetails } from "@/types";

export default function StudentContactRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["student-contact-requests", user?.id],
    queryFn: () => contactRequestsApi.getForStudent(user!.id),
    enabled: !!user,
  });

  const respondMutation = useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "accepted" | "declined";
    }) => contactRequestsApi.respond(requestId, user!.id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["student-contact-requests"] });
      toast({
        title: status === "accepted" ? "Request accepted" : "Request declined",
        description:
          status === "accepted"
            ? "Company contact details are now visible."
            : "The company has been notified.",
      });
    },
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
      key: "company",
      header: "Company",
      sortable: true,
      sortValue: (row) => row.company?.companyName ?? "",
      exportValue: (row) => row.company?.companyName ?? "",
      cell: (row) => (
        <div>
          <p className="font-semibold">{row.company?.companyName ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.company?.industry}</p>
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
    {
      key: "contact",
      header: "Contact",
      cell: (row) =>
        row.status === "accepted" && row.company ? (
          <span className="text-sm font-medium text-primary">
            {row.company.user.email}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) =>
        row.status === "pending" ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-8 rounded-full"
              onClick={() =>
                respondMutation.mutate({ requestId: row.id, status: "accepted" })
              }
              disabled={respondMutation.isPending}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full"
              onClick={() =>
                respondMutation.mutate({ requestId: row.id, status: "declined" })
              }
              disabled={respondMutation.isPending}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null,
    },
  ];

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Requests"
        description="Manage incoming requests from companies"
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
      </PageHeader>

      {requests.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Pending", count: stats.pending, color: "text-amber-600" },
            { label: "Accepted", count: stats.accepted, color: "text-emerald-600" },
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
          title={requests.length === 0 ? "No contact requests" : "No matching requests"}
          description={
            requests.length === 0
              ? "When companies are interested in your profile, their requests will appear here."
              : "Try changing the status filter."
          }
        />
      ) : view === "cards" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((req) => (
            <ContactRequestCard
              key={req.id}
              request={req}
              variant="incoming"
              isLoading={respondMutation.isPending}
              onAccept={() =>
                respondMutation.mutate({ requestId: req.id, status: "accepted" })
              }
              onDecline={() =>
                respondMutation.mutate({ requestId: req.id, status: "declined" })
              }
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchable
          exportable
          searchPlaceholder="Search companies or messages..."
        />
      )}
    </div>
  );
}
