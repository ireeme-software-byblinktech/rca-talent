"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { AdminPageHero } from "@/components/admin/AdminPageHero";
import { VerificationChecklist } from "@/components/admin/VerificationChecklist";
import {
  VerificationDetailSection,
  VerificationReviewPanel,
} from "@/components/admin/VerificationReviewPanel";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { adminApi } from "@/lib/api/admin";
import { COHORT_YEARS } from "@/lib/mock/data";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { cn, formatRelativeDate } from "@/lib/utils";
import {
  getStudentChecklist,
  getStudentCompleteness,
} from "@/lib/verification-utils";
import type { StudentWithUser } from "@/types";

type QueueRow = StudentWithUser & { id: string };

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function AdminVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cohortYear, setCohortYear] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [reviewStudent, setReviewStudent] = useState<StudentWithUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: metrics } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => adminApi.getMetrics(),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-pending-students", searchQuery, cohortYear, page, pageSize],
    queryFn: () =>
      adminApi.getPendingStudents({
        query: searchQuery || undefined,
        cohortYear: cohortYear !== "all" ? Number(cohortYear) : undefined,
        page,
        pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const rows: QueueRow[] = useMemo(
    () =>
      (data?.data ?? []).map((student) => ({
        ...student,
        id: student.userId,
      })),
    [data?.data]
  );

  const approveMutation = useMutation({
    mutationFn: (studentId: string) => adminApi.approveStudent(user!.id, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Student approved", description: "Profile is now visible to employers." });
      setReviewStudent(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ studentId, reason }: { studentId: string; reason: string }) =>
      adminApi.rejectStudent(user!.id, studentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Student rejected" });
      setShowRejectDialog(false);
      setReviewStudent(null);
      setRejectReason("");
    },
  });

  const checklist = reviewStudent ? getStudentChecklist(reviewStudent) : [];
  const canApprove =
    checklist.length > 0 && checklist.filter((c) => c.met).length >= 4;

  const columns: Column<QueueRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Student",
        sortable: true,
        sortValue: (row) => row.fullName,
        exportValue: (row) => row.fullName,
        cell: (row) => (
          <div>
            <p className="font-semibold text-foreground">{row.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.user.email}</p>
          </div>
        ),
      },
      {
        key: "cohort",
        header: "Cohort",
        sortable: true,
        sortValue: (row) => row.cohortYear,
        exportValue: (row) => String(row.cohortYear),
        cell: (row) => <span className="text-sm">Class of {row.cohortYear}</span>,
      },
      {
        key: "completeness",
        header: "Completeness",
        sortable: true,
        sortValue: (row) => getStudentCompleteness(row),
        exportValue: (row) => `${getStudentCompleteness(row)}%`,
        cell: (row) => {
          const score = getStudentCompleteness(row);
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                score >= 80
                  ? "bg-emerald-500/10 text-emerald-700"
                  : score >= 50
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {score}%
            </span>
          );
        },
      },
      {
        key: "skills",
        header: "Skills",
        exportValue: (row) => row.skills.join(", "),
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.skills.length} skill{row.skills.length !== 1 ? "s" : ""}
          </span>
        ),
      },
      {
        key: "submitted",
        header: "Updated",
        sortable: true,
        sortValue: (row) => row.updatedAt,
        exportValue: (row) => row.updatedAt,
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeDate(row.updatedAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full"
            onClick={() => setReviewStudent(row)}
          >
            Review
          </Button>
        ),
      },
    ],
    []
  );

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  if (isLoading && !data) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <AdminPageHero
        title="Student Verification"
        description="Search and review pending profiles in a paginated queue — built to scale to thousands of applications."
        icon={GraduationCap}
        metrics={[
          {
            label: "Pending total",
            value: metrics?.pendingStudents ?? total,
            tone: "text-amber-600",
          },
          {
            label: "This page",
            value: rows.length,
            tone: "text-primary",
          },
          {
            label: "Ready (this page)",
            value: rows.filter((s) => getStudentCompleteness(s) >= 80).length,
            tone: "text-emerald-600",
          },
        ]}
      />

      <div className="fancy-card space-y-4 rounded-2xl border border-border/50 p-4 !translate-y-0 !shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, bio, or skill..."
              className="rounded-xl border-0 bg-secondary pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select
            value={cohortYear}
            onValueChange={(v) => {
              setCohortYear(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full rounded-xl lg:w-44">
              <SelectValue placeholder="All cohorts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cohorts</SelectItem>
              {COHORT_YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  Class of {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full rounded-xl lg:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {total === 0 ? (
          <EmptyState
            icon={<GraduationCap className="h-10 w-10" />}
            title="Verification queue is clear"
            description={
              searchQuery || cohortYear !== "all"
                ? "No pending students match your filters."
                : "All student profiles have been reviewed. New submissions will appear here."
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">{total}</span>{" "}
                pending
                {isFetching && (
                  <span className="ml-2 text-xs text-primary">Updating…</span>
                )}
              </span>
            </div>

            <DataTable
              columns={columns}
              data={rows}
              pageSize={rows.length || 1}
              exportable
              emptyMessage="No students on this page"
            />

            <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={!!reviewStudent}
        onOpenChange={(open) => !open && setReviewStudent(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Review application</DialogTitle>
          </DialogHeader>
          {reviewStudent && (
            <VerificationReviewPanel
              title={reviewStudent.fullName}
              subtitle={reviewStudent.user.email}
              initial={reviewStudent.fullName.charAt(0).toUpperCase()}
              variant="student"
              meta={[
                { label: "Cohort", value: String(reviewStudent.cohortYear) },
                {
                  label: "Availability",
                  value: reviewStudent.availability.join(", ") || "—",
                },
                {
                  label: "Completeness",
                  value: `${getStudentCompleteness(reviewStudent)}%`,
                },
              ]}
              actions={
                <>
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link
                      href={`/company/students/${reviewStudent.userId}`}
                      target="_blank"
                    >
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      View profile
                    </Link>
                  </Button>
                  <Button
                    className="flex-1 rounded-full"
                    onClick={() => approveMutation.mutate(reviewStudent.userId)}
                    disabled={approveMutation.isPending || !canApprove}
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full text-destructive hover:text-destructive"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </>
              }
            >
              <VerificationChecklist items={checklist} />
              {!canApprove && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                  At least 4 checklist items must pass before approval is enabled.
                </p>
              )}
              <VerificationDetailSection label="About">
                <p className="text-sm leading-relaxed text-foreground">
                  {reviewStudent.bio || "No bio provided."}
                </p>
              </VerificationDetailSection>
              <VerificationDetailSection label="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {reviewStudent.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="skill-pill">
                      {s}
                    </Badge>
                  ))}
                </div>
              </VerificationDetailSection>
              <VerificationDetailSection label="Links & documents">
                <div className="space-y-2 text-sm">
                  {reviewStudent.links.github && (
                    <a
                      href={reviewStudent.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {reviewStudent.links.linkedin && (
                    <a
                      href={reviewStudent.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {reviewStudent.links.portfolio && (
                    <a
                      href={reviewStudent.links.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {!reviewStudent.links.github &&
                    !reviewStudent.links.linkedin &&
                    !reviewStudent.links.portfolio && (
                      <p className="text-muted-foreground">No links provided</p>
                    )}
                </div>
              </VerificationDetailSection>
            </VerificationReviewPanel>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject student profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The student will be notified with your reason and can resubmit after
              making changes.
            </p>
            <div className="space-y-2">
              <Label>Rejection reason</Label>
              <Textarea
                rows={4}
                placeholder="Explain what needs to be corrected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full rounded-full"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() =>
                reviewStudent &&
                rejectMutation.mutate({
                  studentId: reviewStudent.userId,
                  reason: rejectReason,
                })
              }
            >
              Confirm rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
