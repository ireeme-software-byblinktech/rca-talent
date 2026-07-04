"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Check,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import type { ContactRequestWithDetails } from "@/types";

interface ContactRequestCardProps {
  request: ContactRequestWithDetails;
  variant: "incoming" | "outgoing";
  onAccept?: () => void;
  onDecline?: () => void;
  isLoading?: boolean;
  className?: string;
}

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
];

const STATUS_OVERLAY: Record<string, string> = {
  pending: "from-amber-900/70 via-primary/85 to-primary/60",
  accepted: "from-emerald-900/60 via-primary/80 to-primary/55",
  declined: "from-slate-800/70 via-primary/75 to-primary/60",
};

function getCoverImage(key: string, photoUrl?: string): string {
  if (photoUrl && !photoUrl.startsWith("/mock/")) return photoUrl;
  return COVER_IMAGES[key.charCodeAt(0) % COVER_IMAGES.length];
}

export function ContactRequestCard({
  request,
  variant,
  onAccept,
  onDecline,
  isLoading,
  className,
}: ContactRequestCardProps) {
  const isIncoming = variant === "incoming";
  const title = isIncoming
    ? request.company?.companyName ?? "Unknown company"
    : request.student?.fullName ?? "Unknown student";
  const subtitle = isIncoming
    ? request.company?.industry ?? "Company"
    : `RCA Class of ${request.student?.cohortYear ?? "—"}`;
  const initial = title.charAt(0).toUpperCase();
  const photoUrl = isIncoming ? undefined : request.student?.photoUrl;
  const cover = getCoverImage(title, photoUrl);
  const overlay = STATUS_OVERLAY[request.status] ?? STATUS_OVERLAY.pending;
  const profileHref = !isIncoming && request.studentId
    ? `/company/students/${request.studentId}`
    : null;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20",
        request.status === "declined" && "opacity-90",
        className
      )}
    >
      {/* Branded cover */}
      <div className="relative aspect-[16/9] overflow-hidden bg-primary">
        <Image
          src={cover}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
          unoptimized={cover.startsWith("/mock/")}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t", overlay)} />
        <div className="absolute inset-0 landing-grid opacity-[0.07]" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            {isIncoming ? (
              <>
                <Building2 className="h-3 w-3" />
                Recruiter
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                RCA Talent
              </>
            )}
          </span>
          {!isIncoming && request.student && (
            <Badge
              variant="secondary"
              className="border-0 bg-white/90 text-foreground text-[10px] backdrop-blur-sm"
            >
              Class of {request.student.cohortYear}
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <StatusBadge
            status={request.status}
            className={cn(
              "border-white/25 backdrop-blur-md",
              request.status === "pending" && "bg-amber-500/90 text-white",
              request.status === "accepted" && "bg-emerald-500/90 text-white",
              request.status === "declined" && "bg-white/20 text-white"
            )}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-lg font-bold text-white backdrop-blur-sm">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white leading-snug truncate drop-shadow-sm">{title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/85 truncate">
              {isIncoming ? (
                subtitle
              ) : (
                <>
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  {subtitle}
                </>
              )}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
              <Calendar className="h-3 w-3" />
              {formatDate(request.createdAt)} · {formatRelativeDate(request.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="rounded-xl border border-border/40 bg-muted/25 px-4 py-3.5">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            {isIncoming ? "Recruiter message" : "Your message"}
          </p>
          <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4">{request.message}</p>
        </div>

        {request.status === "accepted" && (
          <div className="mt-4 rounded-xl border border-emerald-200/50 bg-emerald-50/50 px-4 py-3.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Check className="h-4 w-4 shrink-0" />
              Contact unlocked
            </p>
            <div className="mt-2.5 space-y-2">
              {isIncoming && request.company && (
                <>
                  <a
                    href={`mailto:${request.company.user.email}`}
                    className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-emerald-100 hover:ring-emerald-200"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{request.company.user.email}</span>
                  </a>
                  {request.company.website && (
                    <a
                      href={request.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-primary ring-1 ring-emerald-100"
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      <span className="truncate flex-1">
                        {request.company.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                </>
              )}
              {!isIncoming && request.student && (
                <a
                  href={`mailto:${request.student.user.email}`}
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-emerald-100"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  {request.student.user.email}
                </a>
              )}
            </div>
          </div>
        )}

        {request.status === "declined" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            This request was declined.
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border/50 pt-4">
          {profileHref && (
            <Button variant="outline" size="sm" className="rounded-full flex-1" asChild>
              <Link href={profileHref}>View profile</Link>
            </Button>
          )}
          {request.status === "pending" && isIncoming && onAccept && onDecline && (
            <>
              <Button
                size="sm"
                className="rounded-full flex-1"
                onClick={onAccept}
                disabled={isLoading}
              >
                <Check className="mr-1.5 h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full flex-1"
                onClick={onDecline}
                disabled={isLoading}
              >
                <X className="mr-1.5 h-4 w-4" />
                Decline
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
