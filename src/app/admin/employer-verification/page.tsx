"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
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
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { cn, formatRelativeDate } from "@/lib/utils";
import {
  getCompanyChecklist,
  getCompanyCompleteness,
} from "@/lib/verification-utils";
import type { CompanyWithUser } from "@/types";

type QueueRow = CompanyWithUser & { id: string };

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function AdminEmployerVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [reviewCompany, setReviewCompany] = useState<CompanyWithUser | null>(null);
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
    queryKey: [
      "admin-pending-companies",
      searchQuery,
      industryFilter,
      page,
      pageSize,
    ],
    queryFn: () =>
      adminApi.getPendingCompanies({
        query: searchQuery || undefined,
        industry: industryFilter !== "all" ? industryFilter : undefined,
        page,
        pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const rows: QueueRow[] = useMemo(
    () =>
      (data?.data ?? []).map((company) => ({
        ...company,
        id: company.userId,
      })),
    [data?.data]
  );

  const industryOptions = useMemo(() => {
    const industries = new Set(
      rows.map((c) => c.industry.trim()).filter(Boolean)
    );
    return Array.from(industries).sort();
  }, [rows]);

  const approveMutation = useMutation({
    mutationFn: (companyId: string) => adminApi.approveCompany(user!.id, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({
        title: "Employer approved",
        description: "Company can now post jobs and contact students.",
      });
      setReviewCompany(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ companyId, reason }: { companyId: string; reason: string }) =>
      adminApi.rejectCompany(user!.id, companyId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      toast({ title: "Employer rejected" });
      setShowRejectDialog(false);
      setReviewCompany(null);
      setRejectReason("");
    },
  });

  const checklist = reviewCompany ? getCompanyChecklist(reviewCompany) : [];
  const metCount = checklist.filter((c) => c.met).length;
  const canApprove = checklist.length > 0 && metCount >= 4;
  const missingItems = checklist.filter((c) => !c.met).map((c) => c.label);

  const columns: Column<QueueRow>[] = useMemo(
    () => [
      {
        key: "company",
        header: "Company",
        sortable: true,
        sortValue: (row) => row.companyName,
        exportValue: (row) => row.companyName,
        cell: (row) => (
          <div>
            <p className="font-semibold text-foreground">{row.companyName}</p>
            <p className="text-xs text-muted-foreground">{row.user.email}</p>
          </div>
        ),
      },
      {
        key: "industry",
        header: "Industry",
        sortable: true,
        sortValue: (row) => row.industry,
        exportValue: (row) => row.industry,
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.industry || "—"}
          </span>
        ),
      },
      {
        key: "completeness",
        header: "Completeness",
        sortable: true,
        sortValue: (row) => getCompanyCompleteness(row),
        exportValue: (row) => `${getCompanyCompleteness(row)}%`,
        cell: (row) => {
          const score = getCompanyCompleteness(row);
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
        key: "website",
        header: "Website",
        exportValue: (row) => row.website ?? "",
        cell: (row) =>
          row.website ? (
            <a
              href={row.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Link <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
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
            onClick={() => setReviewCompany(row)}
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
        title="Employer Verification"
        description="Search and review pending company registrations in a paginated queue — built to scale to thousands of applications."
        icon={Building2}
        metrics={[
          {
            label: "Pending total",
            value: metrics?.pendingCompanies ?? total,
            tone: "text-amber-600",
          },
          {
            label: "This page",
            value: rows.length,
            tone: "text-primary",
          },
          {
            label: "Ready (this page)",
            value: rows.filter((c) => getCompanyCompleteness(c) >= 80).length,
            tone: "text-emerald-600",
          },
        ]}
      />

      <div className="fancy-card space-y-4 rounded-2xl border border-border/50 p-4 !translate-y-0 !shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search company, email, industry, or description..."
              className="rounded-xl border-0 bg-secondary pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select
            value={industryFilter}
            onValueChange={(v) => {
              setIndustryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full rounded-xl lg:w-44">
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industryOptions.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
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
            icon={<Building2 className="h-10 w-10" />}
            title="No pending employers"
            description={
              searchQuery || industryFilter !== "all"
                ? "No pending companies match your filters."
                : "All company accounts have been reviewed. New registrations will appear here."
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
              emptyMessage="No companies on this page"
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
        open={!!reviewCompany}
        onOpenChange={(open) => !open && setReviewCompany(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Review employer registration</DialogTitle>
          </DialogHeader>
          {reviewCompany && (
            <VerificationReviewPanel
              title={reviewCompany.companyName}
              subtitle={reviewCompany.user.email}
              initial={reviewCompany.companyName.charAt(0).toUpperCase()}
              variant="company"
              meta={[
                { label: "Industry", value: reviewCompany.industry || "—" },
                {
                  label: "Completeness",
                  value: `${getCompanyCompleteness(reviewCompany)}%`,
                },
              ]}
              actions={
                <>
                  {reviewCompany.website && (
                    <Button variant="outline" className="rounded-full" asChild>
                      <a
                        href={reviewCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        Visit website
                      </a>
                    </Button>
                  )}
                  <Button
                    className="flex-1 rounded-full"
                    onClick={() => approveMutation.mutate(reviewCompany.userId)}
                    disabled={approveMutation.isPending || !canApprove}
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Approve employer
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
                  {missingItems.length > 0 && (
                    <> Still needed: {missingItems.join(", ")}.</>
                  )}
                </p>
              )}
              <VerificationDetailSection label="Company overview">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {reviewCompany.description || "No description provided."}
                </p>
              </VerificationDetailSection>
              <VerificationDetailSection label="Business details">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Industry</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {reviewCompany.industry || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Contact email</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {reviewCompany.user.email}
                    </dd>
                  </div>
                  {reviewCompany.website && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Website</dt>
                      <dd className="mt-0.5">
                        <a
                          href={reviewCompany.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          {reviewCompany.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </VerificationDetailSection>
            </VerificationReviewPanel>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject employer registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The company contact will receive your feedback and may reapply after
              updating their profile.
            </p>
            <div className="space-y-2">
              <Label>Reason for rejection</Label>
              <Textarea
                rows={4}
                placeholder="Explain why this registration cannot be approved..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full rounded-full"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() =>
                reviewCompany &&
                rejectMutation.mutate({
                  companyId: reviewCompany.userId,
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
