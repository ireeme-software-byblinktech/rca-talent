"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { BlogPostCard } from "@/components/shared/BlogPostCard";
import { BlogSubscribeForm } from "@/components/shared/BlogSubscribeForm";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { blogApi } from "@/lib/api/blog";

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => blogApi.listPublished(),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <div className="mx-auto flex max-w-2xl flex-col items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                RCA Talent Blog
              </h1>
              <p className="mt-3 text-muted-foreground">
                Career insights, student success stories, and hiring tips for
                Rwanda&apos;s tech community.
              </p>
              <div className="mt-6 w-full max-w-md">
                <BlogSubscribeForm variant="inline" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <LoadingSkeleton rows={3} />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground">No posts published yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <BlogPostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
