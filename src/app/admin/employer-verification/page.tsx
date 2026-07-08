"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Building2, Check, ExternalLink, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  getCompanyChecklist,
  getCompanyCompleteness,
} from "@/lib/verification-utils";

export default function AdminEmployerVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [search, setSearch] = useState("");

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ["admin-pending-companies"],
    queryFn: () => adminApi.getPendingCompanies(),
    refetchOnWindowFocus: true,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
    );
  }, [pending, search]);

  const selected = useMemo(() => {
    if (filtered.length === 0) return null;
    if (selectedId) {
      return filtered.find((c) => c.userId === selectedId) ?? filtered[0];
    }
    return filtered[0];
  }, [filtered, selectedId]);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId && !filtered.some((c) => c.userId === selectedId)) {
      setSelectedId(filtered[0].userId);
    }
  }, [filtered, selectedId]);

  const approveMutation = useMutation({
    mutationFn: (companyId: string) => adminApi.approveCompany(user!.id, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Employer approved", description: "Company can now post jobs and contact students." });
      setSelectedId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ companyId, reason }: { companyId: string; reason: string }) =>
      adminApi.rejectCompany(user!.id, companyId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Employer rejected" });
      setShowReject(false);
      setSelectedId(null);
      setRejectReason("");
    },
  });

  const avgCompleteness = useMemo(() => {
    if (pending.length === 0) return 0;
    const total = pending.reduce((sum, c) => sum + getCompanyCompleteness(c), 0);
    return Math.round(total / pending.length);
  }, [pending]);

  if (isLoading) return <LoadingSkeleton rows={4} />;

  const checklist = selected ? getCompanyChecklist(selected) : [];
  const metCount = checklist.filter((c) => c.met).length;
  const canApprove = checklist.length > 0 && metCount >= 4;
  const missingItems = checklist.filter((c) => !c.met).map((c) => c.label);

  return (
    <div className="space-y-6">
      <AdminPageHero
        title="Employer Verification"
        description="Validate company registrations before granting access to search talent and post jobs."
        icon={Building2}
        metrics={[
          { label: "Pending registrations", value: pending.length, tone: "text-amber-600" },
          { label: "Avg. completeness", value: `${avgCompleteness}%`, tone: "text-primary" },
          {
            label: "Ready to approve",
            value: pending.filter((c) => getCompanyCompleteness(c) >= 80).length,
            tone: "text-emerald-600",
          },
        ]}
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title="No pending employers"
          description="All company accounts have been reviewed. New registrations will appear here."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-5">
          <div className="space-y-4 xl:col-span-2">
            <h2 className="text-sm font-semibold text-foreground">
              Review queue
              <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
                {filtered.length}
              </span>
            </h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by company, email, or industry..."
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
                filtered.map((company) => (
                  <VerificationQueueCard
                    key={company.userId}
                    variant="company"
                    title={company.companyName}
                    subtitle={`${company.user.email} · ${company.industry}`}
                    badges={[company.industry]}
                    submittedAt={company.updatedAt}
                    completeness={getCompanyCompleteness(company)}
                    selected={selected?.userId === company.userId}
                    onClick={() => setSelectedId(company.userId)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="xl:col-span-3">
            <VerificationReviewPanel
              title={selected?.companyName ?? ""}
              subtitle={selected?.user.email}
              initial={selected?.companyName.charAt(0).toUpperCase() ?? ""}
              variant="company"
              emptyMessage="No registration selected"
              emptyHint="Select an employer from the review queue to verify their business details and approve or reject access."
              meta={
                selected
                  ? [
                      { label: "Industry", value: selected.industry },
                      {
                        label: "Completeness",
                        value: `${getCompanyCompleteness(selected)}%`,
                      },
                    ]
                  : []
              }
              actions={
                selected ? (
                  <>
                    {selected.website && (
                      <Button variant="outline" className="rounded-full" asChild>
                        <a href={selected.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1.5 h-4 w-4" />
                          Visit website
                        </a>
                      </Button>
                    )}
                    <Button
                      className="flex-1 rounded-full gap-1.5"
                      onClick={() => approveMutation.mutate(selected.userId)}
                      disabled={approveMutation.isPending || !canApprove}
                    >
                      <Check className="h-4 w-4" />
                      Approve employer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setShowReject(true)}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </>
                ) : undefined
              }
            >
              {selected && (
                <>
                  <VerificationChecklist items={checklist} />
                  {!canApprove && (
                    <p className="text-xs text-amber-700 bg-amber-500/10 rounded-lg px-3 py-2">
                      At least 4 checklist items must pass before approval is enabled.
                      {missingItems.length > 0 && (
                        <> Still needed: {missingItems.join(", ")}.</>
                      )}
                    </p>
                  )}
                  <VerificationDetailSection label="Company overview">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selected.description || "No description provided."}
                    </p>
                  </VerificationDetailSection>
                  <VerificationDetailSection label="Business details">
                    <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Industry</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{selected.industry}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Contact email</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{selected.user.email}</dd>
                      </div>
                      {selected.website && (
                        <div className="sm:col-span-2">
                          <dt className="text-muted-foreground">Website</dt>
                          <dd className="mt-0.5">
                            <a
                              href={selected.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                              {selected.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </VerificationDetailSection>
                </>
              )}
            </VerificationReviewPanel>
          </div>
        </div>
      )}

      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject employer registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The company contact will receive your feedback and may reapply after updating their profile.
            </p>
            <div>
              <Label>Reason for rejection</Label>
              <Textarea
                className="mt-1.5"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this registration cannot be approved..."
                rows={4}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full rounded-full"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() =>
                selected &&
                rejectMutation.mutate({
                  companyId: selected.userId,
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
