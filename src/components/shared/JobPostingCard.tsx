"use client";

import Image from "next/image";
import {
  Briefcase,
  Clock,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn, formatDate } from "@/lib/utils";
import type { JobPosting, JobType } from "@/types";

const TYPE_COVERS: Record<JobType, string> = {
  "full-time":
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  internship:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  freelance:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
};

const TYPE_LABELS: Record<JobType, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  freelance: "Freelance",
};

export function getJobCover(job: JobPosting): string {
  return TYPE_COVERS[job.type];
}

interface JobPostingCardProps {
  job: JobPosting;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
  isToggling?: boolean;
  className?: string;
}

export function JobPostingCard({
  job,
  onEdit,
  onToggleStatus,
  onDelete,
  isToggling,
  className,
}: JobPostingCardProps) {
  const isOpen = job.status === "open";
  const cover = getJobCover(job);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20",
        !isOpen && "opacity-90",
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
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/30" />
        <div className="absolute inset-0 landing-grid opacity-[0.07]" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            <Briefcase className="h-3 w-3" />
            RCA Talent
          </span>
          <Badge
            variant="secondary"
            className="border-0 bg-white/90 text-foreground text-[10px] capitalize backdrop-blur-sm"
          >
            {TYPE_LABELS[job.type]}
          </Badge>
        </div>

        <div className="absolute right-3 top-3">
          <StatusBadge
            status={job.status}
            className={cn(
              "border-white/25 backdrop-blur-md",
              isOpen ? "bg-emerald-500/90 text-white" : "bg-white/20 text-white"
            )}
          />
        </div>

        {!onEdit && !onDelete ? null : (
          <div className="absolute right-3 bottom-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/95 shadow-md"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/95 text-destructive shadow-md"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
            {job.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
            <MapPin className="h-3 w-3 shrink-0" />
            {job.location}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {job.description}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0 text-primary/70" />
          Posted {formatDate(job.createdAt)}
        </div>

        {job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="skill-pill text-[11px]">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="skill-pill skill-pill-muted text-[11px]">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {onToggleStatus && (
          <div className="mt-4 border-t border-border/50 pt-4">
            <Button
              variant={isOpen ? "outline" : "default"}
              size="sm"
              className="w-full rounded-full gap-1.5"
              onClick={onToggleStatus}
              disabled={isToggling}
            >
              {isOpen ? (
                "Close posting"
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reopen posting
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
