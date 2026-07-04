"use client";

import { Calendar, DollarSign, FileSignature, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractStatusBadge } from "@/components/shared/ContractStatusBadge";
import { cn, formatDate } from "@/lib/utils";
import type { ContractWithDetails } from "@/types";

interface ContractCardProps {
  contract: ContractWithDetails;
  variant: "student" | "company";
  onView: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function ContractCard({
  contract,
  variant,
  onView,
  onAction,
  actionLabel,
  className,
}: ContractCardProps) {
  const counterparty =
    variant === "student"
      ? contract.company?.companyName ?? "Company"
      : contract.student?.fullName ?? "Student";

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          contract.status === "signed"
            ? "bg-emerald-500"
            : contract.status === "pending_student" || contract.status === "pending_company"
              ? "bg-amber-500"
              : contract.status === "declined" || contract.status === "void"
                ? "bg-slate-300"
                : "bg-primary/40"
        )}
      />

      <div className="flex flex-1 flex-col p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSignature className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2">{contract.title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{counterparty}</p>
            </div>
          </div>
          <ContractStatusBadge status={contract.status} className="shrink-0" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            {contract.role}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(contract.startDate)}
          </span>
          <span className="col-span-2 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            {contract.compensation}
          </span>
        </div>

        <div className="mt-4 flex gap-2 border-t border-border/50 pt-4">
          <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={onView}>
            View PDF
          </Button>
          {onAction && actionLabel && (
            <Button size="sm" className="flex-1 rounded-lg" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
