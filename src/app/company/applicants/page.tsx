"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { jobsApi } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { JobApplication } from "@/types";

const STATUS_FILTERS = [
  "all",
  "applied",
  "under_review",
  "accepted",
  "rejected",
] as const;

export default function CompanyApplicantsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewMode>("table");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<JobApplication | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["company-applications", user?.id],
    queryFn: () => jobsApi.getApplicationsForCompany(user!.id),
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    if (statusFilter === "all") return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  const updateMutation = useMutation({
    mutationFn: ({
      application,
      status,
    }: {
      application: JobApplication;
      status: "under_review" | "accepted" | "rejected";
    }) =>
      jobsApi.updateApplicationStatus(
        user!.id,
        application.jobId,
        application.id,
        status
      ),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["company-applications"] });
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["company-candidates"] });
      toast({
        title:
          vars.status === "accepted"
            ? "Applicant accepted"
            : vars.status === "rejected"
              ? "Application rejected"
              : "Marked under review",
        description:
          vars.status === "accepted"
            ? "Contact channel opened — you can message them and schedule an interview."
            : undefined,
      });
      setSelected(null);
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not update application",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const columns: Column<JobApplication>[] = useMemo(
    () => [
      {
        key: "student",
        header: "Applicant",
        sortable: true,
        sortValue: (row) => row.student?.fullName ?? "",
        exportValue: (row) => row.student?.fullName ?? row.studentId,
        cell: (row) => (
          <div>
            <p className="font-semibold">{row.student?.fullName ?? "Student"}</p>
            <p className="text-xs text-muted-foreground">
              Class of {row.student?.cohortYear ?? "—"}
            </p>
          </div>
        ),
      },
      {
        key: "job",
        header: "Role",
        sortable: true,
        sortValue: (row) => row.job?.title ?? "",
        exportValue: (row) => row.job?.title ?? "",
        cell: (row) => <span className="text-sm">{row.job?.title ?? "—"}</span>,
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        sortValue: (row) => row.status,
        exportValue: (row) => row.status,
        cell: (row) => (
          <Badge variant="outline" className="capitalize">
            {row.status.replace(/_/g, " ")}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        header: "Applied",
        sortable: true,
        sortValue: (row) => row.createdAt,
        exportValue: (row) => formatDate(row.createdAt),
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) => (
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => setSelected(row)}
            >
              Review
            </Button>
            {row.studentId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full"
                asChild
              >
                <Link href={`/company/students/${row.studentId}`}>Profile</Link>
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicants"
        description="Review students who applied to your job postings — accept to unlock messaging, interviews, and contracts"
      >
        <ViewToggle value={view} onChange={setView} />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All statuses" : s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      {applications.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No applications yet"
          description="When students apply from Opportunities, they will show up here."
          action={{
            label: "Manage job postings",
            onClick: () => {
              window.location.href = "/company/jobs";
            },
          }}
        />
      ) : view === "table" ? (
        <DataTable
          columns={columns}
          data={filtered}
          searchable
          exportable
          searchPlaceholder="Search applicants..."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((app) => (
            <article
              key={app.id}
              className="rounded-none border border-border/50 bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {app.student?.fullName ?? "Student"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {app.job?.title ?? "Role"}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize shrink-0">
                  {app.status.replace(/_/g, " ")}
                </Badge>
              </div>
              {app.coverLetter && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                  {app.coverLetter}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelected(app)}
                >
                  Review
                </Button>
                {app.studentId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    asChild
                  >
                    <Link href={`/company/students/${app.studentId}`}>
                      View profile
                    </Link>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review application</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-none border border-border/50 bg-muted/30 p-3 text-sm space-y-1">
                <p className="font-semibold">
                  {selected.student?.fullName ?? "Student"}
                </p>
                <p className="text-muted-foreground">
                  Applied for <strong>{selected.job?.title}</strong> on{" "}
                  {formatDate(selected.createdAt)}
                </p>
                <Badge variant="outline" className="capitalize mt-1">
                  {selected.status.replace(/_/g, " ")}
                </Badge>
              </div>
              {selected.coverLetter ? (
                <div>
                  <p className="text-sm font-medium">Cover letter</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {selected.coverLetter}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No cover letter provided.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {selected.status === "applied" && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        application: selected,
                        status: "under_review",
                      })
                    }
                  >
                    Mark under review
                  </Button>
                )}
                {selected.status !== "accepted" &&
                  selected.status !== "rejected" && (
                    <>
                      <Button
                        className="rounded-full"
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            application: selected,
                            status: "accepted",
                          })
                        }
                      >
                        {updateMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        className="rounded-full"
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            application: selected,
                            status: "rejected",
                          })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                {selected.status === "accepted" && (
                  <>
                    <Button className="rounded-full" asChild>
                      <Link href="/company/messages">Open messages</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full" asChild>
                      <Link href="/company/interviews">Schedule interview</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full" asChild>
                      <Link href="/company/contracts">Create contract</Link>
                    </Button>
                  </>
                )}
                {selected.studentId && (
                  <Button variant="ghost" className="rounded-full" asChild>
                    <Link href={`/company/students/${selected.studentId}`}>
                      Full profile
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
