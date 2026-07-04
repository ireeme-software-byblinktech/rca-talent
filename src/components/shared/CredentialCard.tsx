"use client";

import Image from "next/image";
import { Award, Calendar, ExternalLink, Pencil, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { Achievement, Certification } from "@/types";

const CERT_FALLBACK =
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80";

interface CertificationCardProps {
  certification: Certification;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function CertificationCard({
  certification,
  onEdit,
  onDelete,
  readOnly = false,
  className,
}: CertificationCardProps) {
  const thumbnail = certification.imageUrl || CERT_FALLBACK;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-elevated hover:border-primary/20",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={thumbnail}
          alt={certification.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-black/30 text-amber-300 backdrop-blur-sm">
          <Award className="h-4 w-4" />
        </div>
        {!readOnly && (onEdit || onDelete) && (
          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
          <h3 className="font-bold text-white line-clamp-2 drop-shadow-md">
            {certification.title}
          </h3>
          <p className="mt-0.5 text-xs text-white/80">{certification.issuer}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Issued {formatDate(certification.issueDate)}
        </div>
        {certification.credentialUrl && (
          <a
            href={certification.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <ExternalLink className="h-3 w-3" />
            View credential
          </a>
        )}
      </div>
    </article>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function AchievementCard({
  achievement,
  onEdit,
  onDelete,
  readOnly = false,
  className,
}: AchievementCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-elevated hover:border-primary/20",
        className
      )}
    >
      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-primary to-accent" />
      <div className="flex flex-1 gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary ring-1 ring-primary/15">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
              {achievement.title}
            </h3>
            {!readOnly && (onEdit || onDelete) && (
              <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {onEdit && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {achievement.description}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(achievement.date)}
          </div>
        </div>
      </div>
    </article>
  );
}
