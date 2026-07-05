import Link from "next/link";
import { ArrowRight, MessageSquare, Search, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import {
  FeatureGrid,
  MarketingCTA,
  StatsStrip,
} from "@/components/marketing/MarketingSections";
import { AudienceCardsSection, LandingHero } from "@/components/marketing/LandingSections";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        <LandingHero />

        <StatsStrip
          stats={[
            { value: "120+", label: "RCA Graduates" },
            { value: "45+", label: "Partner Companies" },
            { value: "280+", label: "Projects Showcased" },
            { value: "95%", label: "Verified Profiles" },
          ]}
        />

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

        <MarketingCTA
          title="Ready to get started?"
          description="Join hundreds of RCA students and employers already using the platform."
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
      </main>

      <PublicFooter />
    </div>
  );
}
