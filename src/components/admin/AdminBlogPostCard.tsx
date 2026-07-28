"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getReadingTimeMinutes, formatViewCount } from "@/lib/blog/utils";
import { resolveMediaUrl } from "@/lib/config/env";
import {
  authorInitials,
  BLOG_COVER_FALLBACK,
  BlogCardFrame,
} from "@/components/shared/blog-card-theme";
import { cn, formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

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
  onEdit,
  onDelete,
  onTogglePublish,
  isToggling,
  className,
}: AdminBlogPostCardProps) {
  const coverUrl = resolveMediaUrl(post.coverImage);
  const readingTime = getReadingTimeMinutes(post.content);

  return (
    <BlogCardFrame className={className}>
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border/40 bg-muted/30">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", BLOG_COVER_FALLBACK)} />
        )}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-4">
          <Badge
            variant={post.published ? "approved" : "pending"}
            className="rounded-full capitalize"
          >
            {post.published ? "Published" : "Draft"}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              {readingTime} min read
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Eye className="h-3 w-3" />
              {formatViewCount(post.viewCount ?? 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
            {authorInitials(post.author)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{post.author}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatViewCount(post.viewCount ?? 0)} views
              </span>
            </p>
          </div>
        </div>

        <p className="mt-3 truncate font-mono text-[11px] text-muted-foreground">
          /blog/{post.slug}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <div className="mr-auto flex items-center gap-2">
            <Switch
              checked={post.published}
              onCheckedChange={onTogglePublish}
              disabled={isToggling}
            />
            <span className="text-xs text-muted-foreground">
              {post.published ? "Live on site" : "Not published"}
            </span>
          </div>
          {post.published && (
            <Button variant="outline" size="sm" className="h-8 rounded-full" asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </BlogCardFrame>
  );
}
