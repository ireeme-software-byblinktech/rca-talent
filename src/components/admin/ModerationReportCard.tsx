"use client";

import { Check, Flag, MessageSquare, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { ContentReport } from "@/types";

interface ModerationReportCardProps {
  report: ContentReport;
  onResolve?: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  student: <User className="h-4 w-4" />,
  company: <Flag className="h-4 w-4" />,
  project: <Flag className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
};

const TYPE_GRADIENTS: Record<string, string> = {
  student: "from-amber-600/90 via-primary/85 to-primary/70",
  company: "from-rose-600/90 via-primary/85 to-accent/70",
  project: "from-violet-600/90 via-primary/85 to-accent/70",
  message: "from-sky-600/90 via-primary/85 to-primary/70",
};

export function ModerationReportCard({
  report,
  onResolve,
  onDismiss,
  isLoading,
  className,
}: ModerationReportCardProps) {
  const isPending = report.status === "pending";
  const gradient = TYPE_GRADIENTS[report.targetType] ?? TYPE_GRADIENTS.student;
  const icon = TYPE_ICONS[report.targetType] ?? TYPE_ICONS.student;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        !isPending && "opacity-85",
        isPending && "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20",
        className
      )}
    >
      <div className={cn("relative px-5 py-4 bg-gradient-to-r text-white", gradient)}>
        <div className="absolute inset-0 landing-grid opacity-[0.07]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-sm">
              {icon}
            </div>
            <div>
              <p className="font-semibold capitalize">{report.targetType} report</p>
              <p className="text-xs text-white/75 font-mono truncate max-w-[200px]">
                {report.targetId}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "border-white/25 backdrop-blur-md capitalize shrink-0",
              isPending && "bg-amber-500/90 text-white border-0",
              report.status === "resolved" && "bg-emerald-500/90 text-white border-0",
              report.status === "dismissed" && "bg-white/20 text-white border-0"
            )}
          >
            {report.status}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-foreground leading-relaxed">{report.reason}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Reported {formatRelativeDate(report.createdAt)}
        </p>

        {isPending && onResolve && onDismiss && (
          <div className="mt-auto flex gap-2 border-t border-border/50 pt-4">
            <Button
              size="sm"
              className="flex-1 rounded-full"
              onClick={onResolve}
              disabled={isLoading}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Resolve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={onDismiss}
              disabled={isLoading}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        )}

        {!isPending && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs capitalize">
              {report.status}
            </Badge>
          </div>
        )}
      </div>
    </article>
  );
}
