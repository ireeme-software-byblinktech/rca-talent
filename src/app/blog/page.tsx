"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Newspaper } from "lucide-react";
import { BlogPostCard } from "@/components/shared/BlogPostCard";
import { BlogSubscribeForm } from "@/components/shared/BlogSubscribeForm";
import { PageHero } from "@/components/marketing/MarketingSections";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { blogApi } from "@/lib/api/blog";

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => blogApi.listPublished(),
  });

  const [featured, ...rest] = posts;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <PageHero
          centered
          badge={
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              RCA Talent Blog
            </span>
          }
          title="Insights for students and employers"
          description="Career guidance, student success stories, and hiring tips for Rwanda's tech community."
          actions={
            <div className="w-full max-w-md">
              <BlogSubscribeForm variant="inline" />
            </div>
          }
        />

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <LoadingSkeleton rows={3} />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground/60" />
              <p className="mt-4 font-medium text-foreground">No posts published yet</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                New articles from RCA Talent will appear here once published.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {featured && (
                <div>
                  <div className="mb-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                      Featured
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-foreground">
                      Latest article
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <BlogPostCard post={featured} />
                  </div>
                </div>
              )}

              {rest.length > 0 && (
                <div>
                  <div className="mb-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                      Archive
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-foreground">
                      More articles
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {rest.map((post, i) => (
                      <BlogPostCard key={post.id} post={post} index={i + 1} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
