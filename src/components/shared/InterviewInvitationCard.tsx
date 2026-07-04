"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Check,
  Clock,
  MapPin,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { InterviewWithDetails } from "@/lib/api/interviews";

interface InterviewInvitationCardProps {
  interview: InterviewWithDetails;
  variant: "company" | "student";
  jobTitle?: string;
  onMarkCompleted?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  isLoading?: boolean;
  className?: string;
}

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
];

const STATUS_OVERLAY: Record<string, string> = {
  pending: "from-amber-900/70 via-primary/85 to-primary/60",
  accepted: "from-emerald-900/60 via-primary/80 to-primary/55",
  completed: "from-primary/90 via-primary/80 to-accent/70",
  declined: "from-slate-800/70 via-primary/75 to-primary/60",
};

function getCover(key: string): string {
  return COVER_IMAGES[key.charCodeAt(0) % COVER_IMAGES.length];
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function InterviewInvitationCard({
  interview,
  variant,
  jobTitle,
  onMarkCompleted,
  onAccept,
  onDecline,
  isLoading,
  className,
}: InterviewInvitationCardProps) {
  const isCompany = variant === "company";
  const title = isCompany
    ? interview.student?.fullName ?? "Candidate"
    : interview.company?.companyName ?? "Company";
  const subtitle = isCompany
    ? `RCA Class of ${interview.student?.cohortYear ?? "—"}`
    : interview.company?.industry ?? "Interview invitation";
  const initial = title.charAt(0).toUpperCase();
  const overlay = STATUS_OVERLAY[interview.status] ?? STATUS_OVERLAY.pending;
  const profileHref =
    isCompany && interview.studentId
      ? `/company/students/${interview.studentId}`
      : null;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20",
        interview.status === "declined" && "opacity-90",
        className
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-primary">
        <Image
          src={getCover(title)}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t", overlay)} />
        <div className="absolute inset-0 landing-grid opacity-[0.07]" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            <Calendar className="h-3 w-3" />
            RCA Talent
          </span>
          {jobTitle && (
            <Badge
              variant="secondary"
              className="border-0 bg-white/90 text-foreground text-[10px] backdrop-blur-sm max-w-[140px] truncate"
            >
              {jobTitle}
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <StatusBadge
            status={interview.status}
            className={cn(
              "border-white/25 backdrop-blur-md capitalize",
              interview.status === "pending" && "bg-amber-500/90 text-white",
              interview.status === "accepted" && "bg-emerald-500/90 text-white",
              interview.status === "completed" && "bg-primary/90 text-white",
              interview.status === "declined" && "bg-white/20 text-white"
            )}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-lg font-bold text-white backdrop-blur-sm">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white leading-snug truncate drop-shadow-sm">{title}</h3>
            <p className="mt-0.5 text-xs text-white/85 truncate">{subtitle}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
              <Clock className="h-3 w-3" />
              Sent {formatRelativeDate(interview.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{interview.message}</p>

        <div className="mt-4 space-y-2 rounded-xl border border-border/40 bg-muted/25 px-4 py-3">
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Scheduled
              </p>
              <p className="font-medium text-foreground">{formatDateTime(interview.scheduledAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Location
              </p>
              <p className="font-medium text-foreground">{interview.location}</p>
            </div>
          </div>
          {jobTitle && (
            <div className="flex items-start gap-2 text-sm">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </p>
                <p className="font-medium text-foreground">{jobTitle}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border/50 pt-4">
          {profileHref && (
            <Button variant="outline" size="sm" className="rounded-full flex-1" asChild>
              <Link href={profileHref}>
                <User className="mr-1.5 h-3.5 w-3.5" />
                View profile
              </Link>
            </Button>
          )}
          {isCompany && (interview.status === "accepted" || interview.status === "pending") && onMarkCompleted && (
            <Button
              size="sm"
              className="rounded-full flex-1"
              onClick={onMarkCompleted}
              disabled={isLoading}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Mark completed
            </Button>
          )}
          {!isCompany && interview.status === "pending" && onAccept && onDecline && (
            <>
              <Button
                size="sm"
                className="rounded-full flex-1"
                onClick={onAccept}
                disabled={isLoading}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full flex-1"
                onClick={onDecline}
                disabled={isLoading}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Decline
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
