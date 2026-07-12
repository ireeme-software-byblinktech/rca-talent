"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Briefcase, Building2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { JobPostingCard } from "@/components/shared/JobPostingCard";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { jobsApi } from "@/lib/api/jobs";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { JobPosting } from "@/types";

export default function StudentJobsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewMode>("table");
  const [selected, setSelected] = useState<JobPosting | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["open-jobs"],
    queryFn: () => jobsApi.getOpen(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["my-job-applications"],
    queryFn: () => jobsApi.getMyApplications(),
  });

  const appliedJobIds = useMemo(
    () => new Set(applications.map((a) => a.jobId)),
    [applications]
  );

  const applyMutation = useMutation({
    mutationFn: () =>
      jobsApi.apply(selected!.id, coverLetter.trim() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-job-applications"] });
      toast({
        title: "Application submitted",
        description: "The company can now review your application.",
      });
      setSelected(null);
      setCoverLetter("");
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not apply",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  const columns: Column<JobPosting>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Role",
        sortable: true,
        sortValue: (row) => row.title,
        exportValue: (row) => row.title,
        cell: (row) => (
          <div>
            <p className="font-semibold">{row.title}</p>
            <p className="max-w-xs text-xs text-muted-foreground line-clamp-1">
              {row.description}
            </p>
          </div>
        ),
      },
      {
        key: "company",
        header: "Company",
        sortable: true,
        sortValue: (row) => row.companyName ?? "",
        exportValue: (row) => row.companyName ?? "",
        cell: (row) => (
          <span className="text-sm">{row.companyName ?? "—"}</span>
        ),
      },
      {
        key: "type",
        header: "Type",
        exportValue: (row) => row.type,
        cell: (row) => (
          <Badge variant="outline" className="capitalize">
            {row.type.replace("-", " ")}
          </Badge>
        ),
      },
      {
        key: "location",
        header: "Location",
        exportValue: (row) => row.location,
        cell: (row) => (
          <span className="flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {row.location || "—"}
            {row.isRemote ? " · Remote" : ""}
          </span>
        ),
      },
      {
        key: "skills",
        header: "Skills",
        exportValue: (row) => row.skills.join(", "),
        cell: (row) => (
          <div className="flex max-w-[200px] flex-wrap gap-1">
            {row.skills.slice(0, 3).map((s) => (
              <span key={s} className="skill-pill text-[10px]">
                {s}
              </span>
            ))}
            {row.skills.length > 3 && (
              <span className="skill-pill skill-pill-muted text-[10px]">
                +{row.skills.length - 3}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "posted",
        header: "Posted",
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
        cell: (row) =>
          appliedJobIds.has(row.id) ? (
            <Badge variant="secondary">Applied</Badge>
          ) : (
            <Button
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setSelected(row);
                setCoverLetter("");
              }}
            >
              Apply
            </Button>
          ),
      },
    ],
    [appliedJobIds]
  );

  if (isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Browse open jobs and internships from verified companies"
      >
        <ViewToggle value={view} onChange={setView} />
      </PageHeader>

      {applications.length > 0 && (
        <div className="rounded-none border border-border/50 bg-card p-4">
          <p className="text-sm font-medium">
            Your applications{" "}
            <span className="text-muted-foreground">
              ({applications.length})
            </span>
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {applications.slice(0, 5).map((app) => (
              <li key={app.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">
                  {app.job?.title ?? "Job"}
                </span>
                {app.job?.companyName && (
                  <span>· {app.job.companyName}</span>
                )}
                <Badge variant="outline" className="capitalize text-[10px]">
                  {app.status.replace(/_/g, " ")}
                </Badge>
                {app.status === "accepted" && (
                  <span className="text-xs text-emerald-700">
                    Next: check Messages · Interviews · Contracts
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-10 w-10" />}
          title="No open opportunities"
          description="Companies haven’t posted any active roles yet. Check back soon."
        />
      ) : view === "cards" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card"
            >
              <JobPostingCard
                job={job}
                className="rounded-none border-0 shadow-none hover:translate-y-0 hover:shadow-none"
              />
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/50 px-5 py-3">
                <div className="min-w-0">
                  {job.companyName && (
                    <p className="flex items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {job.companyName}
                    </p>
                  )}
                  {job.compensation && (
                    <p className="truncate text-xs text-muted-foreground">
                      {job.compensation}
                    </p>
                  )}
                </div>
                {appliedJobIds.has(job.id) ? (
                  <Badge variant="secondary">Applied</Badge>
                ) : (
                  <Button
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => {
                      setSelected(job);
                      setCoverLetter("");
                    }}
                  >
                    Apply
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={jobs}
          searchable
          exportable
          searchPlaceholder="Search opportunities..."
        />
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setCoverLetter("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply — {selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-none border border-border/50 bg-muted/30 p-3 text-sm">
                <p className="font-medium">
                  {selected.companyName ?? "Company"}
                </p>
                <p className="mt-1 text-muted-foreground line-clamp-3">
                  {selected.description}
                </p>
                {selected.compensation && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {selected.compensation}
                  </p>
                )}
              </div>
              <div>
                <Label>Cover letter (optional)</Label>
                <Textarea
                  className="mt-1.5"
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly introduce yourself and why you're a fit..."
                />
              </div>
              <Button
                className="w-full rounded-full"
                disabled={applyMutation.isPending}
                onClick={() => applyMutation.mutate()}
              >
                {applyMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit application
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
