"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, GraduationCap, Search, X } from "lucide-react";
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
import { AdminPageHero } from "@/components/admin/AdminPageHero";
import { VerificationChecklist } from "@/components/admin/VerificationChecklist";
import { VerificationQueueCard } from "@/components/admin/VerificationQueueCard";
import {
  VerificationDetailSection,
  VerificationReviewPanel,
} from "@/components/admin/VerificationReviewPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { adminApi } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import {
  getStudentChecklist,
  getStudentCompleteness,
} from "@/lib/verification-utils";

export default function AdminVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [search, setSearch] = useState("");

  const { data: pendingStudents = [], isLoading } = useQuery({
    queryKey: ["admin-pending-students"],
    queryFn: () => adminApi.getPendingStudents(),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pendingStudents;
    return pendingStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        s.skills.some((skill) => skill.toLowerCase().includes(q))
    );
  }, [pendingStudents, search]);

  const selectedStudent = useMemo(() => {
    if (filtered.length === 0) return null;
    if (selectedStudentId) {
      return filtered.find((s) => s.userId === selectedStudentId) ?? filtered[0];
    }
    return filtered[0];
  }, [filtered, selectedStudentId]);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedStudentId(null);
      return;
    }
    if (selectedStudentId && !filtered.some((s) => s.userId === selectedStudentId)) {
      setSelectedStudentId(filtered[0].userId);
    }
  }, [filtered, selectedStudentId]);

  const approveMutation = useMutation({
    mutationFn: (studentId: string) => adminApi.approveStudent(user!.id, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Student approved", description: "Profile is now visible to employers." });
      setSelectedStudentId(null);
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
      setSelectedStudentId(null);
      setRejectReason("");
    },
  });

  const avgCompleteness = useMemo(() => {
    if (pendingStudents.length === 0) return 0;
    const total = pendingStudents.reduce((sum, s) => sum + getStudentCompleteness(s), 0);
    return Math.round(total / pendingStudents.length);
  }, [pendingStudents]);

  if (isLoading) return <LoadingSkeleton rows={4} />;

  const checklist = selectedStudent ? getStudentChecklist(selectedStudent) : [];
  const canApprove = checklist.length > 0 && checklist.filter((c) => c.met).length >= 4;

  return (
    <div className="space-y-6">
      <AdminPageHero
        title="Student Verification"
        description="Review RCA graduate profiles before they become visible to employers on the platform."
        icon={GraduationCap}
        metrics={[
          { label: "Pending applications", value: pendingStudents.length, tone: "text-amber-600" },
          { label: "Avg. completeness", value: `${avgCompleteness}%`, tone: "text-primary" },
          {
            label: "Ready to approve",
            value: pendingStudents.filter((s) => getStudentCompleteness(s) >= 80).length,
            tone: "text-emerald-600",
          },
        ]}
      />

      {pendingStudents.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-10 w-10" />}
          title="Verification queue is clear"
          description="All student profiles have been reviewed. New submissions will appear here."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-5">
          <div className="space-y-4 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">
                Review queue
                <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {filtered.length}
                </span>
              </h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or skill..."
                className="rounded-xl border-0 bg-secondary pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2.5">
              {filtered.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
                  No matches for &ldquo;{search}&rdquo;
                </p>
              ) : (
                filtered.map((student) => (
                  <VerificationQueueCard
                    key={student.userId}
                    variant="student"
                    title={student.fullName}
                    subtitle={`${student.user.email} · Class of ${student.cohortYear}`}
                    badges={student.skills}
                    submittedAt={student.updatedAt}
                    completeness={getStudentCompleteness(student)}
                    selected={selectedStudent?.userId === student.userId}
                    onClick={() => setSelectedStudentId(student.userId)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="xl:col-span-3">
            <VerificationReviewPanel
              title={selectedStudent?.fullName ?? ""}
              subtitle={selectedStudent?.user.email}
              initial={selectedStudent?.fullName.charAt(0).toUpperCase() ?? ""}
              variant="student"
              emptyMessage="No application selected"
              emptyHint="Select a student from the review queue to inspect their profile, run the checklist, and approve or reject."
              meta={
                selectedStudent
                  ? [
                      { label: "Cohort", value: String(selectedStudent.cohortYear) },
                      {
                        label: "Availability",
                        value: selectedStudent.availability.join(", ") || "—",
                      },
                      {
                        label: "Completeness",
                        value: `${getStudentCompleteness(selectedStudent)}%`,
                      },
                    ]
                  : []
              }
              actions={
                selectedStudent ? (
                  <>
                    <Button variant="outline" className="rounded-full" asChild>
                      <Link href={`/company/students/${selectedStudent.userId}`} target="_blank">
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        View profile
                      </Link>
                    </Button>
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => approveMutation.mutate(selectedStudent.userId)}
                      disabled={approveMutation.isPending || !canApprove}
                    >
                      <Check className="mr-1.5 h-4 w-4" />
                      Approve profile
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
                ) : undefined
              }
            >
              {selectedStudent && (
                <>
                  <VerificationChecklist items={checklist} />
                  {!canApprove && (
                    <p className="text-xs text-amber-700 bg-amber-500/10 rounded-lg px-3 py-2">
                      At least 4 checklist items must pass before approval is enabled.
                    </p>
                  )}
                  <VerificationDetailSection label="About">
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedStudent.bio || "No bio provided."}
                    </p>
                  </VerificationDetailSection>
                  <VerificationDetailSection label="Skills">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="skill-pill">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </VerificationDetailSection>
                  <VerificationDetailSection label="Links & documents">
                    <div className="space-y-2 text-sm">
                      {selectedStudent.links.github && (
                        <a
                          href={selectedStudent.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          GitHub <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {selectedStudent.links.linkedin && (
                        <a
                          href={selectedStudent.links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          LinkedIn <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {selectedStudent.links.portfolio && (
                        <a
                          href={selectedStudent.links.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          Portfolio <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {!selectedStudent.links.github &&
                        !selectedStudent.links.linkedin &&
                        !selectedStudent.links.portfolio && (
                          <p className="text-muted-foreground">No links provided</p>
                        )}
                    </div>
                  </VerificationDetailSection>
                </>
              )}
            </VerificationReviewPanel>
          </div>
        </div>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject student profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The student will be notified with your reason and can resubmit after making changes.
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
                selectedStudent &&
                rejectMutation.mutate({
                  studentId: selectedStudent.userId,
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
