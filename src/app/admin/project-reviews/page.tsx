"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Code2,
  ExternalLink,
  FolderSearch,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ProjectShowcaseCard } from "@/components/shared/ProjectShowcaseCard";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { adminProjectsApi } from "@/lib/api/adminProjects";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { PendingProjectWithStudent } from "@/lib/api/adminProjects";

export default function AdminProjectReviewsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<PendingProjectWithStudent | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [view, setView] = useState<ViewMode>("cards");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-pending-projects"],
    queryFn: () => adminProjectsApi.getPendingProjects(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminProjectsApi.approveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-projects"] });
      toast({ title: "Project approved", description: "The student will be notified." });
    },
    onError: () =>
      toast({ variant: "destructive", title: "Failed to approve project" }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminProjectsApi.rejectProject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-projects"] });
      setRejectTarget(null);
      setRejectReason("");
      toast({ title: "Project rejected", description: "The student has been notified." });
    },
    onError: () =>
      toast({ variant: "destructive", title: "Failed to reject project" }),
  });

  const columns: Column<PendingProjectWithStudent>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Project",
        sortable: true,
        sortValue: (row) => row.title,
        exportValue: (row) => row.title,
        cell: (row) => (
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate max-w-[180px]">{row.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">{row.description}</p>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        sortable: true,
        sortValue: (row) => row.student?.fullName ?? "",
        exportValue: (row) => row.student?.fullName ?? "",
        cell: (row) => (
          <div>
            <p className="text-sm font-medium">{row.student?.fullName ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{row.student?.email ?? ""}</p>
          </div>
        ),
      },
      {
        key: "techStack",
        header: "Tech Stack",
        exportValue: (row) => row.techStack.join(", "),
        cell: (row) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {row.techStack.slice(0, 4).map((t) => (
              <span key={t} className="skill-pill text-[10px]">{t}</span>
            ))}
            {row.techStack.length > 4 && (
              <span className="skill-pill skill-pill-muted text-[10px]">+{row.techStack.length - 4}</span>
            )}
          </div>
        ),
      },
      {
        key: "links",
        header: "Links",
        exportValue: (row) => [row.links.demo, row.links.repo].filter(Boolean).join(", "),
        cell: (row) => (
          <div className="flex gap-2 text-xs text-muted-foreground">
            {row.links.demo && (
              <a href={row.links.demo} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary">
                <ExternalLink className="h-3 w-3" /> Demo
              </a>
            )}
            {row.links.repo && (
              <a href={row.links.repo} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary">
                <Code2 className="h-3 w-3" /> Repo
              </a>
            )}
          </div>
        ),
      },
      {
        key: "updatedAt",
        header: "Submitted",
        sortable: true,
        sortValue: (row) => row.updatedAt,
        exportValue: (row) => formatDate(row.updatedAt),
        cell: (row) => (
          <span className="text-xs text-muted-foreground">{formatDate(row.updatedAt)}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1 rounded-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => approveMutation.mutate(row.id)}
              disabled={approveMutation.isPending}
            >
              <CheckCircle2 className="h-3 w-3" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 rounded-full h-7 text-xs border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => { setRejectTarget(row); setRejectReason(""); }}
            >
              <XCircle className="h-3 w-3" /> Reject
            </Button>
          </div>
        ),
      },
    ],
    [approveMutation]
  );

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Reviews"
        description={`${projects.length} project${projects.length !== 1 ? "s" : ""} pending review`}
      >
        <ViewToggle value={view} onChange={setView} />
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderSearch className="h-8 w-8" />}
          title="No projects pending review"
          description="When students submit projects for publication they will appear here."
        />
      ) : view === "cards" ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectShowcaseCard
              key={project.id}
              project={project}
              owner={project.student}
              variant="review"
              approvePending={approveMutation.isPending}
              onApprove={() => approveMutation.mutate(project.id)}
              onReject={() => {
                setRejectTarget(project);
                setRejectReason("");
              }}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects.map((p) => ({ ...p, id: p.id }))}
          searchable
          exportable
          searchPlaceholder="Search by project or student name..."
        />
      )}

      {/* Reject reason dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Provide an optional reason for rejecting{" "}
            <span className="font-medium text-foreground">
              {rejectTarget?.title}
            </span>
            . This will be shown to the student.
          </p>
          <div className="space-y-2 mt-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Project description is incomplete…"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive hover:bg-destructive/90"
              disabled={rejectMutation.isPending}
              onClick={() => {
                if (rejectTarget) {
                  rejectMutation.mutate({
                    id: rejectTarget.id,
                    reason: rejectReason.trim() || undefined,
                  });
                }
              }}
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
