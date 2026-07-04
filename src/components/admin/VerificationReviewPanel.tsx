"use client";

import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerificationReviewPanelProps {
  title: string;
  subtitle?: string;
  initial: string;
  variant: "student" | "company";
  children: React.ReactNode;
  actions?: React.ReactNode;
  emptyMessage?: string;
  emptyHint?: string;
  meta?: { label: string; value: string }[];
  className?: string;
}

const GRADIENTS = {
  student: "from-emerald-700 via-primary to-accent",
  company: "from-sky-700 via-primary to-accent",
};

export function VerificationReviewPanel({
  title,
  subtitle,
  initial,
  variant,
  children,
  actions,
  emptyMessage = "Select an application to review",
  emptyHint = "Choose a pending item from the queue on the left to view details and take action.",
  meta = [],
  className,
}: VerificationReviewPanelProps) {
  const hasContent = title !== "";

  return (
    <div
      className={cn(
        "sticky top-20 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card",
        className
      )}
    >
      {hasContent ? (
        <>
          <div className={cn("relative px-6 py-5 bg-gradient-to-br text-white", GRADIENTS[variant])}>
            <div className="absolute inset-0 landing-grid opacity-[0.07]" />
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold backdrop-blur-sm">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-0 bg-amber-400/90 text-amber-950 text-[10px] uppercase tracking-wide">
                      Pending review
                    </Badge>
                  </div>
                  <h3 className="mt-2 text-xl font-bold tracking-tight truncate">{title}</h3>
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-white/80 truncate">{subtitle}</p>
                  )}
                </div>
              </div>

              {meta.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {meta.map((m) => (
                    <span
                      key={m.label}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs backdrop-blur-sm"
                    >
                      <span className="text-white/60">{m.label}</span>
                      <span className="font-medium text-white">{m.value}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5 p-6">{children}</div>

          {actions && (
            <div className="flex gap-3 border-t border-border/50 bg-muted/10 p-6">{actions}</div>
          )}
        </>
      ) : (
        <div className="flex min-h-[420px] flex-col items-center justify-center p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList className="h-8 w-8" />
          </div>
          <p className="mt-4 text-base font-semibold text-foreground">{emptyMessage}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{emptyHint}</p>
        </div>
      )}
    </div>
  );
}

export function VerificationDetailSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/40 bg-muted/15 p-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}
