import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getReadingTimeMinutes, formatViewCount } from "@/lib/blog/utils";
import { resolveMediaUrl } from "@/lib/config/env";
import {
  authorInitials,
  BLOG_COVER_FALLBACK,
  BlogCardFrame,
} from "@/components/shared/blog-card-theme";
import { cn, formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
  className?: string;
}

export function BlogPostCard({ post, className }: BlogPostCardProps) {
  const coverUrl = resolveMediaUrl(post.coverImage);
  const readingTime = getReadingTimeMinutes(post.content);

  return (
    <Link href={`/blog/${post.slug}`} className={cn("group block h-full", className)}>
      <BlogCardFrame className="h-full">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-border/40 bg-muted/30">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className={cn("absolute inset-0 bg-gradient-to-br", BLOG_COVER_FALLBACK)} />
          )}

          <div className="absolute inset-x-0 top-0 flex items-center justify-end gap-2 p-4">
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              {readingTime} min read
            </span>
            {(post.viewCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Eye className="h-3 w-3" />
                {formatViewCount(post.viewCount ?? 0)}
              </span>
            )}
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

          <h2 className="mt-3 text-lg font-semibold leading-snug text-foreground line-clamp-2">
            {post.title}
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
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
                  {formatDate(post.publishedAt)}
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

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Read article
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </BlogCardFrame>
    </Link>
  );
}
