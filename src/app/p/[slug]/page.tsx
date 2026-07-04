"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPortfolioView } from "@/components/shared/PublicPortfolioView";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { portfolioApi } from "@/lib/api/portfolio";

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["public-portfolio", slug],
    queryFn: () => portfolioApi.getPublicBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-24">
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Globe className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Portfolio not found</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          This portfolio may be unpublished or the link is incorrect.
        </p>
        <Button className="mt-8 rounded-full" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to RCA Talent
          </Link>
        </Button>
      </div>
    );
  }

  return <PublicPortfolioView portfolio={portfolio} />;
}
