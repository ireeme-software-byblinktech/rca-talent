"use client";

import Link from "next/link";
import { Calendar, ExternalLink, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn, formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

const GRADIENTS = [
  "from-violet-600 to-primary",
  "from-emerald-600 to-primary",
  "from-amber-500 to-accent",
  "from-sky-600 to-primary",
];

interface AdminBlogPostCardProps {
  post: BlogPost;
  index?: number;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: (published: boolean) => void;
  isToggling?: boolean;
  className?: string;
}

export function AdminBlogPostCard({
  post,
  index = 0,
  onEdit,
  onDelete,
  onTogglePublish,
  isToggling,
  className,
}: AdminBlogPostCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20",
        className
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
        <div className="absolute inset-0 landing-grid opacity-[0.07]" />

        <div className="absolute left-3 top-3">
          <Badge
            variant={post.published ? "approved" : "pending"}
            className={cn(
              "backdrop-blur-md border-white/25",
              post.published ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"
            )}
          >
            {post.published ? "Published" : "Draft"}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
            {post.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="border-0 bg-white/90 text-foreground text-[10px]"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.updatedAt)}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground font-mono">/blog/{post.slug}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 mr-auto">
            <Switch
              checked={post.published}
              onCheckedChange={onTogglePublish}
              disabled={isToggling}
            />
            <span className="text-xs text-muted-foreground">
              {post.published ? "Live" : "Draft"}
            </span>
          </div>
          {post.published && (
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-full" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
