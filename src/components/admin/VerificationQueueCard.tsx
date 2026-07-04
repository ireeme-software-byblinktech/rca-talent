"use client";

import { Building2, ChevronRight, Clock, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeDate } from "@/lib/utils";

interface VerificationQueueCardProps {
  title: string;
  subtitle: string;
  badges?: string[];
  selected?: boolean;
  onClick?: () => void;
  variant: "student" | "company";
  submittedAt?: string;
  completeness?: number;
}

const GRADIENTS = {
  student: "from-emerald-600 via-primary to-accent",
  company: "from-sky-600 via-primary to-accent",
};

export function VerificationQueueCard({
  title,
  subtitle,
  badges = [],
  selected,
  onClick,
  variant,
  submittedAt,
  completeness,
}: VerificationQueueCardProps) {
  const initial = title.charAt(0).toUpperCase();
  const Icon = variant === "student" ? GraduationCap : Building2;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full overflow-hidden rounded-2xl border bg-card text-left shadow-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-elevated",
        selected
          ? "border-primary ring-2 ring-primary/15 shadow-elevated"
          : "border-border/50 hover:border-primary/25"
      )}
    >
      <div className="flex items-stretch min-h-[88px]">
        <div
          className={cn(
            "relative flex w-[72px] shrink-0 flex-col items-center justify-center bg-gradient-to-br px-2",
            GRADIENTS[variant]
          )}
        >
          <div className="absolute inset-0 landing-grid opacity-[0.08]" />
          <span className="relative text-lg font-bold text-white">{initial}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="truncate text-sm font-semibold text-foreground">{title}</p>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <ChevronRight
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60 transition-all",
                selected && "text-primary translate-x-0.5",
                "group-hover:translate-x-0.5 group-hover:text-primary/70"
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="pending"
              className="rounded-full text-[10px] font-medium uppercase tracking-wide"
            >
              Pending
            </Badge>
            {submittedAt && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatRelativeDate(submittedAt)}
              </span>
            )}
          </div>

          {typeof completeness === "number" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Profile completeness</span>
                <span className="font-semibold text-foreground">{completeness}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    completeness >= 80 && "bg-emerald-500",
                    completeness >= 50 && completeness < 80 && "bg-amber-500",
                    completeness < 50 && "bg-rose-500"
                  )}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          )}

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.slice(0, 3).map((b) => (
                <Badge key={b} variant="secondary" className="text-[10px] font-normal">
                  {b}
                </Badge>
              ))}
              {badges.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{badges.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
