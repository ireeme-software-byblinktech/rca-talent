"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogSubscribeForm } from "@/components/shared/BlogSubscribeForm";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { blogApi } from "@/lib/api/blog";
import { formatDate } from "@/lib/utils";

function renderContent(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 text-xl font-semibold">
          {block.replace("## ", "")}
        </h2>
      );
    }
    return (
      <p key={i} className="mt-4 leading-relaxed text-muted-foreground">
        {block}
      </p>
    );
  });
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogApi.getBySlug(slug),
    enabled: !!slug,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        {isLoading ? (
          <div className="mx-auto max-w-3xl px-4 py-12">
            <LoadingSkeleton rows={6} />
          </div>
        ) : !post || error ? (
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <h1 className="text-2xl font-bold">Post not found</h1>
            <Link href="/blog" className="mt-4 inline-block text-primary hover:underline">
              Back to blog
            </Link>
          </div>
        ) : (
          <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              All posts
            </Link>
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
            </div>
            <div className="prose prose-neutral mt-10 max-w-none">{renderContent(post.content)}</div>
            <div className="mt-12">
              <BlogSubscribeForm variant="card" />
            </div>
          </article>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
