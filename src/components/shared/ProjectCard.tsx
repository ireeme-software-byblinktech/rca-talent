"use client";

import Image from "next/image";
import {
  BadgeCheck,
  Code2,
  ExternalLink,
  FolderKanban,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatDate, isRenderableImageUrl } from "@/lib/utils";
import type { Project } from "@/types";

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
];

export function getProjectCover(project: Project): string {
  const candidate = project.images?.[0];
  if (candidate && isRenderableImageUrl(candidate)) return candidate;
  const idx = project.title.charCodeAt(0) % FALLBACK_COVERS.length;
  return FALLBACK_COVERS[idx];
}

interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
  className?: string;
  /** Optional owner label under the title */
  ownerLabel?: string;
}

const statusLabel: Record<string, { text: string; className: string }> = {
  approved: {
    text: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending_review: {
    text: "Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  rejected: {
    text: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  private: {
    text: "Private",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  readOnly = false,
  className,
  ownerLabel,
}: ProjectCardProps) {
  const cover = getProjectCover(project);
  const links = project.links ?? {};
  const techStack = project.techStack ?? [];
  const status = statusLabel[project.publishStatus ?? "private"];
  const titleInitial = project.title.trim().charAt(0).toUpperCase() || "P";

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
          alt={project.title}
          fill
          className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/30 to-transparent" />
        <div className="absolute inset-0 bg-[url('/imigongo-pattern.svg')] opacity-[0.12] mix-blend-overlay" />
      </div>

      <div className="relative px-5">
        <div className="-mt-8 flex items-end justify-between gap-2">
          <Avatar className="h-[4.5rem] w-[4.5rem] ring-[3px] ring-card shadow-md shrink-0">
            <AvatarFallback className="bg-brand text-white text-lg font-bold">
              {titleInitial}
            </AvatarFallback>
          </Avatar>

          {!readOnly && (onEdit || onDelete) && (
            <div className="flex gap-1.5 pb-1">
              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-brand/20 bg-card"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit();
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-destructive/30 text-destructive bg-card"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-3 flex-1 flex flex-col">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-[15px] text-foreground truncate leading-tight">
              {project.title}
            </h3>
            {project.publishStatus === "approved" ? (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-sky-500 fill-sky-500/15"
                aria-label="Approved"
              />
            ) : status ? (
              <span
                className={cn(
                  "shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                  status.className
                )}
              >
                {status.text}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {ownerLabel ?? (
              <>
                <FolderKanban className="inline h-3 w-3 mr-1 align-[-2px]" />
                Updated {formatDate(project.updatedAt)}
              </>
            )}
          </p>
        </div>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {project.description || "No description provided."}
        </p>

        {techStack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand/5 text-brand border border-brand/10 px-2 py-0.5 text-[10px] font-medium"
              >
                {t}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
                +{techStack.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 pb-5 flex gap-2.5">
          {links.demo ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl h-10 border-brand/30 text-brand hover:bg-brand/5 hover:text-brand"
              asChild
            >
              <a href={links.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Demo
              </a>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl h-10 border-brand/20 text-muted-foreground"
              disabled
            >
              No demo
            </Button>
          )}
          {links.repo ? (
            <Button
              size="sm"
              className="flex-1 rounded-xl h-10 bg-brand hover:bg-brand/90 text-white"
              asChild
            >
              <a href={links.repo} target="_blank" rel="noopener noreferrer">
                <Code2 className="h-3.5 w-3.5 mr-1.5" />
                Repo
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 rounded-xl h-10 bg-brand/80 text-white"
              disabled
            >
              No repo
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
