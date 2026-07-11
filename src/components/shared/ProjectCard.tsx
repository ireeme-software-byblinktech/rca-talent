"use client";

import Image from "next/image";
import { Code2, ExternalLink, FolderKanban, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate, isRenderableImageUrl } from "@/lib/utils";
import type { Project } from "@/types";

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
];

const HEADER_GRADIENTS = [
  "from-violet-900/80 via-primary/60 to-transparent",
  "from-emerald-900/80 via-teal-900/50 to-transparent",
  "from-amber-900/80 via-orange-900/50 to-transparent",
  "from-rose-900/80 via-pink-900/50 to-transparent",
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
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  readOnly = false,
  className,
}: ProjectCardProps) {
  const cover = getProjectCover(project);
  const gradient = HEADER_GRADIENTS[project.title.charCodeAt(0) % HEADER_GRADIENTS.length];
  const links = project.links ?? {};
  const techStack = project.techStack ?? [];
  const hasLinks = Boolean(links.demo || links.repo);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20",
        className
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={cover}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t", gradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top actions */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            <FolderKanban className="h-3 w-3" />
            Project
          </span>
        </div>

        {!readOnly && (onEdit || onDelete) && (
          <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
            {onEdit && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/95 shadow-md hover:bg-white"
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
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/95 text-destructive shadow-md hover:bg-white"
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

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white drop-shadow-md sm:text-xl line-clamp-1">
            {project.title}
          </h3>
          <p className="mt-0.5 text-xs text-white/80">
            Updated {formatDate(project.updatedAt)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {project.description}
        </p>

        {techStack.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5">
              {techStack.slice(0, 4).map((t) => (
                <span key={t} className="skill-pill text-[11px]">
                  {t}
                </span>
              ))}
              {techStack.length > 4 && (
                <span className="skill-pill-muted skill-pill text-[11px]">
                  +{techStack.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {hasLinks && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-4">
            {links.demo && (
              <a
                href={links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:flex-none"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live demo
              </a>
            )}
            {links.repo && (
              <a
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary sm:flex-none"
              >
                <Code2 className="h-3.5 w-3.5" />
                Repository
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
