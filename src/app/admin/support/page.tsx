"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Eye, LifeBuoy } from "lucide-react";
import { AdminMetricStrip } from "@/components/admin/AdminMetricStrip";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supportApi } from "@/lib/api/support";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { SupportTicket, SupportTicketStatus } from "@/types";

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const CATEGORY_LABEL: Record<string, string> = {
  bug: "Bug",
  improvement: "Improvement",
  question: "Question",
  other: "Other",
};

function statusBadgeVariant(
  status: SupportTicketStatus
): "default" | "secondary" | "outline" | "approved" | "rejected" | "pending" {
  if (status === "resolved") return "approved";
  if (status === "dismissed") return "rejected";
  if (status === "in_progress") return "pending";
  return "secondary";
}

function submitterLabel(ticket: SupportTicket): string {
  const { submitter } = ticket;
  if (submitter.name) return submitter.name;
  return submitter.email;
}

export default function AdminSupportPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: () => supportApi.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNote: note,
    }: {
      id: string;
      status: SupportTicketStatus;
      adminNote?: string;
    }) => supportApi.update(id, { status, adminNote: note }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      setSelected(null);
      toast({
        title:
          status === "resolved"
            ? "Ticket resolved"
            : status === "dismissed"
              ? "Ticket dismissed"
              : "Ticket updated",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not update ticket",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  const metrics = useMemo(
    () => [
      {
        label: "Open",
        value: tickets.filter((t) => t.status === "open").length,
        color: "text-amber-600",
      },
      {
        label: "In progress",
        value: tickets.filter((t) => t.status === "in_progress").length,
        color: "text-sky-600",
      },
      {
        label: "Resolved",
        value: tickets.filter((t) => t.status === "resolved").length,
        color: "text-emerald-600",
      },
      {
        label: "Dismissed",
        value: tickets.filter((t) => t.status === "dismissed").length,
        color: "text-muted-foreground",
      },
    ],
    [tickets]
  );

  const columns: Column<SupportTicket>[] = [
    {
      key: "submitter",
      header: "Submitted by",
      sortable: true,
      sortValue: (row) => submitterLabel(row).toLowerCase(),
      exportValue: (row) =>
        `${submitterLabel(row)} <${row.submitter.email}>${
          row.submitter.role ? ` (${row.submitter.role})` : " (guest)"
        }`,
      cell: (row) => (
        <div className="min-w-[160px]">
          <p className="font-medium leading-tight">{submitterLabel(row)}</p>
          {row.submitter.name ? (
            <p className="text-xs text-muted-foreground">{row.submitter.email}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-1">
            {row.submitter.isRegistered && row.submitter.role ? (
              <Badge variant="outline" className="rounded-full capitalize text-[10px]">
                {row.submitter.role}
              </Badge>
            ) : (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                Guest
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (row) => row.category,
      exportValue: (row) => CATEGORY_LABEL[row.category] ?? row.category,
      cell: (row) => (
        <Badge variant="outline" className="rounded-full">
          {CATEGORY_LABEL[row.category] ?? row.category}
        </Badge>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      sortable: true,
      sortValue: (row) => row.subject.toLowerCase(),
      exportValue: (row) => row.subject,
      cell: (row) => (
        <div className="max-w-[220px]">
          <p className="font-medium truncate" title={row.subject}>
            {row.subject}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2" title={row.message}>
            {row.message}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => row.status,
      exportValue: (row) => STATUS_LABEL[row.status],
      cell: (row) => (
        <Badge variant={statusBadgeVariant(row.status)} className="rounded-full">
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Submitted",
      sortable: true,
      sortValue: (row) => row.createdAt,
      exportValue: (row) => formatDate(row.createdAt),
      cell: (row) => (
        <span className="text-muted-foreground whitespace-nowrap" title={formatDate(row.createdAt)}>
          {formatRelativeDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full"
          onClick={() => {
            setSelected(row);
            setAdminNote(row.adminNote ?? "");
          }}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Review
        </Button>
      ),
    },
  ];

  if (isLoading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support inbox"
        description="Bug reports, improvement ideas, and questions from users"
      />

      {tickets.length > 0 && (
        <AdminMetricStrip
          metrics={metrics}
          className="sm:grid-cols-2 lg:grid-cols-4 lg:max-w-4xl"
        />
      )}

      {tickets.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="h-10 w-10" />}
          title="No support messages"
          description="When users submit feedback from /support, tickets appear here."
        />
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          searchable
          searchPlaceholder="Search by email, subject, or message…"
          exportable
          emptyMessage="No tickets match your search."
        />
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>
                  From {submitterLabel(selected)}
                  {selected.submitter.name ? ` · ${selected.submitter.email}` : ""}
                  {" · "}
                  {formatRelativeDate(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full">
                    {CATEGORY_LABEL[selected.category] ?? selected.category}
                  </Badge>
                  <Badge
                    variant={statusBadgeVariant(selected.status)}
                    className="rounded-full"
                  >
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                  {selected.submitter.isRegistered && selected.submitter.role ? (
                    <Badge variant="outline" className="rounded-full capitalize">
                      {selected.submitter.role} account
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-full">
                      Guest submission
                    </Badge>
                  )}
                </div>

                <div className="rounded-xl border bg-muted/40 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <Select
                    value={selected.status}
                    onValueChange={(value) =>
                      setSelected({
                        ...selected,
                        status: value as SupportTicketStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Admin note</p>
                  <Textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Internal note (optional)"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
                <Button
                  className="rounded-full"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: selected.id,
                      status: selected.status,
                      adminNote,
                    })
                  }
                >
                  Save changes
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
