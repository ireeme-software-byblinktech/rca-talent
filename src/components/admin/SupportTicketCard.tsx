"use client";

import { Bug, HelpCircle, Lightbulb, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { SupportTicket, SupportTicketStatus } from "@/types";
import { useState } from "react";

interface SupportTicketCardProps {
  ticket: SupportTicket;
  onUpdateStatus?: (status: SupportTicketStatus, adminNote?: string) => void;
  isLoading?: boolean;
  className?: string;
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ReactNode; gradient: string }
> = {
  bug: {
    label: "Bug",
    icon: <Bug className="h-4 w-4" />,
    gradient: "from-rose-600/90 via-primary/85 to-primary/70",
  },
  improvement: {
    label: "Improvement",
    icon: <Lightbulb className="h-4 w-4" />,
    gradient: "from-amber-600/90 via-primary/85 to-accent/70",
  },
  question: {
    label: "Question",
    icon: <HelpCircle className="h-4 w-4" />,
    gradient: "from-sky-600/90 via-primary/85 to-primary/70",
  },
  other: {
    label: "Other",
    icon: <MessageCircle className="h-4 w-4" />,
    gradient: "from-violet-600/90 via-primary/85 to-accent/70",
  },
};

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export function SupportTicketCard({
  ticket,
  onUpdateStatus,
  isLoading,
  className,
}: SupportTicketCardProps) {
  const meta = CATEGORY_META[ticket.category] ?? CATEGORY_META.other;
  const isActive = ticket.status === "open" || ticket.status === "in_progress";
  const [note, setNote] = useState(ticket.adminNote ?? "");

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        !isActive && "opacity-85",
        isActive && "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20",
        className
      )}
    >
      <div className={cn("relative px-5 py-4 bg-gradient-to-r text-white", meta.gradient)}>
        <div className="absolute inset-0 landing-grid opacity-[0.07]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-sm">
              {meta.icon}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{ticket.subject}</p>
              <p className="text-xs text-white/75 truncate">{ticket.email}</p>
            </div>
          </div>
          <Badge
            className={cn(
              "border-white/25 backdrop-blur-md shrink-0",
              ticket.status === "open" && "bg-amber-500/90 text-white border-0",
              ticket.status === "in_progress" && "bg-sky-500/90 text-white border-0",
              ticket.status === "resolved" && "bg-emerald-500/90 text-white border-0",
              ticket.status === "dismissed" && "bg-white/20 text-white border-0"
            )}
          >
            {STATUS_LABEL[ticket.status]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Badge variant="outline" className="w-fit text-xs">
          {meta.label}
        </Badge>
        <p className="mt-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {ticket.message}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Submitted {formatRelativeDate(ticket.createdAt)}
        </p>

        {ticket.adminNote && !isActive && (
          <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Note: {ticket.adminNote}
          </p>
        )}

        {isActive && onUpdateStatus && (
          <div className="mt-auto space-y-3 border-t border-border/50 pt-4">
            <Textarea
              placeholder="Optional admin note…"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {ticket.status === "open" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={isLoading}
                  onClick={() => onUpdateStatus("in_progress", note)}
                >
                  Mark in progress
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-full"
                disabled={isLoading}
                onClick={() => onUpdateStatus("resolved", note)}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={isLoading}
                onClick={() => onUpdateStatus("dismissed", note)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
