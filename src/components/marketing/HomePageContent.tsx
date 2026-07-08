"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageSquare, Newspaper, Search, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostCard } from "@/components/shared/BlogPostCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  FeatureGrid,
  MarketingCTA,
  StatsStrip,
} from "@/components/marketing/MarketingSections";
import { AudienceCardsSection, LandingHero } from "@/components/marketing/LandingSections";
import { blogApi } from "@/lib/api/blog";
import {
  EMPTY_PLATFORM_STATS,
  platformApi,
  type PublicPlatformStats,
} from "@/lib/api/platform";
import { queryKeys } from "@/lib/query/keys";
import { formatPublicStat } from "@/lib/utils";

function buildLandingStats(stats: PublicPlatformStats) {
  return {
    hero: {
      graduates: formatPublicStat(stats.totalStudents),
      companies: formatPublicStat(stats.totalCompanies),
      verifiedRate: `${stats.verifiedProfileRate}%`,
    },
    strip: [
      { value: formatPublicStat(stats.totalStudents), label: "RCA Graduates" },
      { value: formatPublicStat(stats.totalCompanies), label: "Partner Companies" },
      { value: formatPublicStat(stats.totalProjects), label: "Projects Showcased" },
      { value: `${stats.verifiedProfileRate}%`, label: "Verified Profiles" },
    ],
    ctaDescription:
      stats.totalStudents + stats.totalCompanies > 0
        ? `Join ${formatPublicStat(stats.totalStudents)} RCA students and ${formatPublicStat(stats.totalCompanies)} employers already using the platform.`
        : "Be among the first to join RCA Talent and help build Rwanda's tech talent marketplace.",
  };
}

export function HomePageContent() {
  const { data: stats = EMPTY_PLATFORM_STATS, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.platform.stats,
    queryFn: () => platformApi.getPublicStats(),
    staleTime: 60_000,
    retry: 1,
    placeholderData: EMPTY_PLATFORM_STATS,
  });

  const {
    data: posts = [],
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery({
    queryKey: queryKeys.blog.posts,
    queryFn: async () => {
      try {
        return await blogApi.listPublished();
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
    retry: 1,
    placeholderData: [],
  });

  const landing = buildLandingStats(stats);
  const latestPosts = posts.slice(0, 3);
  const showPostsLoading = postsLoading && posts.length === 0;

  return (
    <>
      <LandingHero stats={landing.hero} loading={statsLoading} />

      <StatsStrip stats={landing.strip} />

      <AudienceCardsSection />

      <FeatureGrid
        title="How it works"
        subtitle="From profile to placement in three simple steps"
        columns={3}
        items={[
          {
            icon: <Users className="h-8 w-8" />,
            title: "Showcase your work",
            description:
              "Build a portfolio with projects, skills, certifications, and a public page you can share anywhere.",
            stat: "Step One",
          },
          {
            icon: <Shield className="h-8 w-8" />,
            title: "Get verified",
            description:
              "RCA admins review every profile so employers know they're connecting with genuine RCA talent.",
            stat: "Step Two",
          },
          {
            icon: <Search className="h-8 w-8" />,
            title: "Connect & hire",
            description:
              "Companies search, bookmark, message, and invite candidates to interviews — all on one platform.",
            stat: "Step Three",
          },
        ]}
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A2B4B] via-[#2A4070] to-[#3B5998] p-8 shadow-2xl sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-white/90">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Built for Rwanda
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl text-white">
                The talent marketplace RCA graduates deserve
              </h2>
              <p className="mt-3 text-white/80 leading-relaxed">
                Whether you&apos;re launching your career or building your team, RCA Talent
                connects skills with opportunity — simply and transparently.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
              <Button asChild className="rounded-full bg-white text-[#1A2B4B] hover:bg-gray-100 font-semibold">
                <Link href="/blog">Read the blog</Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full border-2 border-white text-white hover:bg-white hover:text-[#1A2B4B] font-semibold">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                From the blog
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Latest insights
              </h2>
              <p className="mt-2 text-muted-foreground">
                Career tips, student stories, and hiring guidance from RCA Talent.
              </p>
            </div>
            <Button variant="outline" className="rounded-full shrink-0" asChild>
              <Link href="/blog">View all posts</Link>
            </Button>
          </div>

          <div className="mt-10">
            {showPostsLoading ? (
              <LoadingSkeleton rows={3} />
            ) : latestPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/60 px-6 py-14 text-center">
                <Newspaper className="h-10 w-10 text-muted-foreground/60" />
                <p className="mt-4 font-medium text-foreground">
                  {postsError ? "Blog posts unavailable right now" : "No blog posts yet"}
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {postsError
                    ? "Check back soon — new articles will appear here once published."
                    : "Published articles from RCA Talent will show up here."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestPosts.map((post, i) => (
                  <BlogPostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <MarketingCTA
        title="Ready to get started?"
        description={landing.ctaDescription}
        button={
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full px-10 shadow-elevated bg-white text-[#1A2B4B] hover:bg-gray-100 font-semibold"
            asChild
          >
            <Link href="/register">
              Create your free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />
    </>
  );
}
