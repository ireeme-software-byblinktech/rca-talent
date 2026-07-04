import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Building2,
  Calendar,
  Filter,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import {
  FeatureGrid,
  MarketingCTA,
  PageHero,
  StatsStrip,
} from "@/components/marketing/MarketingSections";
import { CompanyHeroVisual } from "@/components/marketing/HeroVisuals";

const PROCESS = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "Search & filter",
    desc: "Find candidates by skills, cohort, and availability.",
  },
  {
    icon: <Bookmark className="h-5 w-5" />,
    title: "Review & bookmark",
    desc: "Explore portfolios and save promising talent for later.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Reach out",
    desc: "Send contact requests with a personal message.",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "Interview & hire",
    desc: "Schedule interviews and track your pipeline.",
  },
];

export default function ForCompaniesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <PageHero
          badge={
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Building2 className="h-4 w-4" />
              For Employers & Recruiters
            </span>
          }
          title={
            <>
              Hire verified RCA talent{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                with confidence
              </span>
            </>
          }
          description="Access curated profiles with real project portfolios, admin verification, and structured tools for search, outreach, and interviews."
          actions={
            <>
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/register?role=company">
                  Register your company
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-card/80" asChild>
                <Link href="/login">Sign in to dashboard</Link>
              </Button>
            </>
          }
          visual={<CompanyHeroVisual />}
        />

        <StatsStrip
          stats={[
            { value: "100%", label: "Admin-verified students" },
            { value: "50+", label: "Skills to filter by" },
            { value: "4-step", label: "Hiring workflow" },
            { value: "0", label: "Placement fees" },
          ]}
        />

        <FeatureGrid
          title="Why companies choose RCA Talent"
          subtitle="Portfolio-first hiring built for Rwanda's tech ecosystem"
          items={[
            {
              icon: <Shield className="h-5 w-5" />,
              title: "Verified profiles only",
              description:
                "Every student is reviewed by RCA admins before appearing in search results.",
            },
            {
              icon: <Filter className="h-5 w-5" />,
              title: "Advanced search",
              description:
                "Filter by skills, graduation cohort, availability, and keywords to find the right fit fast.",
            },
            {
              icon: <Search className="h-5 w-5" />,
              title: "Portfolio-first review",
              description:
                "See real projects, tech stacks, and live demos before you ever send a message.",
            },
            {
              icon: <Building2 className="h-5 w-5" />,
              title: "Job postings",
              description:
                "Publish internships and roles, then invite accepted candidates to interviews.",
            },
            {
              icon: <Bookmark className="h-5 w-5" />,
              title: "Talent pipeline",
              description:
                "Bookmark candidates, track sent requests, and manage interviews in one dashboard.",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Direct messaging",
              description:
                "Message candidates directly after they accept your contact request.",
            },
          ]}
        />

        <section className="border-t bg-muted/30 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">Your hiring workflow</h2>
              <p className="mt-3 text-muted-foreground">
                From discovery to interview in four streamlined steps
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((step, i) => (
                <article key={step.title} className="fancy-card relative p-6 text-center">
                  {i < PROCESS.length - 1 && (
                    <div className="absolute -right-2.5 top-1/2 hidden h-px w-5 bg-border lg:block" />
                  )}
                  <div className="feature-icon-wrap mx-auto">{step.icon}</div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <MarketingCTA
          title="Start hiring RCA talent today"
          description="Register your company, get verified, and access Rwanda's best emerging developers."
          button={
            <Button size="lg" variant="secondary" className="rounded-full px-10" asChild>
              <Link href="/register?role=company">
                Register free
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
