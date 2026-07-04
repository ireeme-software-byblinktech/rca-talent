import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

const FALLBACK_GRADIENTS = [
  "from-violet-600 to-primary",
  "from-emerald-600 to-primary",
  "from-amber-500 to-accent",
];

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
  className?: string;
}

export function BlogPostCard({ post, index = 0, className }: BlogPostCardProps) {
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

  return (
    <Link href={`/blog/${post.slug}`} className={cn("group block h-full", className)}>
      <article className="fancy-card flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border-0 bg-white/90 text-foreground backdrop-blur-sm shadow-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h2 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {post.title}
          </h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/50 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read more
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
