"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, Eye, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogContent } from "@/components/shared/BlogContent";
import { BlogSubscribeForm } from "@/components/shared/BlogSubscribeForm";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { blogApi } from "@/lib/api/blog";
import { formatViewCount, getReadingTimeMinutes } from "@/lib/blog/utils";
import { resolveMediaUrl } from "@/lib/config/env";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();
  const viewRecorded = useRef(false);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogApi.getBySlug(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    if (!slug || !post || viewRecorded.current) return;

    const sessionKey = `blog-view-${slug}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
      return;
    }

    viewRecorded.current = true;

    blogApi
      .recordView(slug)
      .then(({ viewCount }) => {
        sessionStorage.setItem(sessionKey, "1");
        queryClient.setQueryData<BlogPost | null>(["blog-post", slug], (current) =>
          current ? { ...current, viewCount } : current
        );
        queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
        queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      })
      .catch(() => {
        viewRecorded.current = false;
      });
  }, [slug, post, queryClient]);

  const coverUrl = resolveMediaUrl(post?.coverImage);
  const readingTime = post ? getReadingTimeMinutes(post.content) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/20">
        {isLoading ? (
          <div className="mx-auto max-w-3xl px-4 py-12">
            <LoadingSkeleton rows={6} />
          </div>
        ) : !post || error ? (
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <h1 className="text-2xl font-semibold">Post not found</h1>
            <p className="mt-2 text-muted-foreground">
              This article may have been removed or is not published yet.
            </p>
            <Link href="/blog" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
              Back to blog
            </Link>
          </div>
        ) : (
          <article className="pb-16">
            <div className="border-b bg-background">
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All posts
                </Link>
              </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-10">
              {coverUrl ? (
                <div className="mb-6 flex justify-center">
                  <div className="relative aspect-[16/10] w-full max-w-xl overflow-hidden rounded-xl border border-border/50 bg-muted/30 shadow-sm">
                    <Image
                      src={coverUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 576px) 100vw, 576px"
                    />
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-border/50 bg-card shadow-card">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <h1 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/50 pt-5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4 shrink-0" />
                      {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 shrink-0" />
                      {readingTime} min read
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-4 w-4 shrink-0" />
                      {formatViewCount(post.viewCount ?? 0)} views
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6 shadow-card sm:p-8">
                <BlogContent content={post.content} />
              </div>

              <div className="mt-10">
                <BlogSubscribeForm variant="card" />
              </div>
            </div>
          </article>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
