"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Code2,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getProjectCover } from "@/components/shared/ProjectCard";
import { cn, formatDate, shouldUnoptimizeImage } from "@/lib/utils";
import type { Project } from "@/types";

export type ProjectShowcaseOwner = {
  id?: string;
  fullName: string;
  userId: string;
  email: string;
  cohortYear?: number | null;
};

interface ProjectShowcaseCardProps {
  project: Project;
  owner?: ProjectShowcaseOwner | null;
  /** Profile URL for @username / avatar click */
  ownerHref?: string;
  variant: "verified" | "review";
  className?: string;
  approvePending?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProjectShowcaseCard({
  project,
  owner,
  ownerHref,
  variant,
  className,
  approvePending,
  onApprove,
  onReject,
}: ProjectShowcaseCardProps) {
  const cover = getProjectCover(project);
  const ownerName = owner?.fullName ?? "Student";
  const ownerHandle = owner?.email
    ? `@${owner.email.split("@")[0]}`
    : "@student";
  const techCount = project.techStack?.length ?? 0;
  const profileHref =
    ownerHref ??
    (owner?.userId
      ? variant === "review"
        ? `/admin/students/${owner.userId}?from=project-reviews`
        : `/company/students/${owner.userId}?from=verified-projects`
      : undefined);

  const avatar = (
    <Avatar className="h-[4.5rem] w-[4.5rem] ring-[3px] ring-card shadow-md shrink-0">
      <AvatarFallback className="bg-brand text-white text-lg font-bold">
        {initials(ownerName)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated hover:border-primary/15",
        className
      )}
    >
      <div className="relative h-28 overflow-hidden bg-brand">
        <Image
          src={cover}
          alt=""
          fill
          className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={shouldUnoptimizeImage(cover)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/30 to-transparent" />
        <div className="absolute inset-0 bg-[url('/imigongo-pattern.svg')] opacity-[0.12] mix-blend-overlay" />
      </div>

      <div className="relative px-5">
        <div className="-mt-8">
          {profileHref ? (
            <Link
              href={profileHref}
              className="inline-block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {avatar}
            </Link>
          ) : (
            avatar
          )}
        </div>
      </div>

      <div className="px-5 pt-3 flex-1 flex flex-col">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-[15px] text-foreground truncate leading-tight">
              {project.title}
            </h3>
            {variant === "verified" ? (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-sky-500 fill-sky-500/15"
                aria-label="Approved"
              />
            ) : (
              <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                Review
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {profileHref ? (
              <Link
                href={profileHref}
                className="font-medium text-brand hover:underline"
              >
                {ownerHandle}
              </Link>
            ) : (
              <span>{ownerHandle}</span>
            )}
            {owner?.fullName ? (
              <span className="text-muted-foreground/70"> · {owner.fullName}</span>
            ) : null}
          </p>
        </div>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {project.description || "No description provided."}
        </p>

        {techCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand/5 text-brand border border-brand/10 px-2 py-0.5 text-[10px] font-medium"
              >
                {t}
              </span>
            ))}
            {techCount > 4 && (
              <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
                +{techCount - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-brand"
            >
              <ExternalLink className="h-3 w-3" /> Demo
            </a>
          )}
          {project.links?.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-brand"
            >
              <Code2 className="h-3 w-3" /> Repo
            </a>
          )}
          <span className="ml-auto">
            {formatDate(project.publishedAt ?? project.updatedAt)}
          </span>
        </div>

        <div className="mt-auto pt-4 pb-5 flex gap-2.5">
          {variant === "verified" && owner && profileHref && (
            <>
              {project.links?.demo || project.links?.repo ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-10 border-brand/30 text-brand hover:bg-brand/5 hover:text-brand"
                  asChild
                >
                  <a
                    href={(project.links.demo || project.links.repo)!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open project
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-10 border-brand/30 text-brand hover:bg-brand/5"
                  disabled
                >
                  No demo link
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1 rounded-xl h-10 bg-brand hover:bg-brand/90 text-white"
                asChild
              >
                <Link href={profileHref}>View owner</Link>
              </Button>
            </>
          )}

          {variant === "review" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl h-10 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5"
                onClick={onReject}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-xl h-10 gap-1.5 bg-brand hover:bg-brand/90 text-white"
                onClick={onApprove}
                disabled={approvePending}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
