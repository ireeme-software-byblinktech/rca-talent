import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  Globe,
  GraduationCap,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import {
  FeatureGrid,
  MarketingCTA,
  PageHero,
  StatsStrip,
} from "@/components/marketing/MarketingSections";
import { StudentHeroVisual } from "@/components/marketing/HeroVisuals";

const STEPS = [
  { num: "01", title: "Create your profile", desc: "Add bio, skills, links, and job preferences." },
  { num: "02", title: "Build your portfolio", desc: "Add projects and publish your public page at /p/your-name." },
  { num: "03", title: "Get verified", desc: "RCA admins review your profile for the verified badge." },
  { num: "04", title: "Land opportunities", desc: "Accept contact requests and chat with recruiters directly." },
];

export default function ForStudentsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <PageHero
          badge={
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <GraduationCap className="h-4 w-4" />
              For RCA Students & Graduates
            </span>
          }
          title={
            <>
              Launch your career with a{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                portfolio that stands out
              </span>
            </>
          }
          description="Build a verified profile, showcase real projects, and get discovered by employers actively hiring tech talent in Rwanda."
          actions={
            <>
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/register?role=student">
                  Create student account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-card/80" asChild>
                <Link href="/p/alice-uwimana">See a live portfolio</Link>
              </Button>
            </>
          }
          visual={<StudentHeroVisual />}
        />

        <StatsStrip
          stats={[
            { value: "92%", label: "Avg. profile completeness" },
            { value: "48h", label: "Avg. verification time" },
            { value: "3×", label: "More employer views" },
            { value: "Free", label: "Always for students" },
          ]}
        />

        <FeatureGrid
          title="Everything you need to get hired"
          subtitle="Tools built specifically for RCA students entering the job market"
          items={[
            {
              icon: <Globe className="h-5 w-5" />,
              title: "Portfolio builder",
              description:
                "Custom URL, themes, and section layout — share /p/your-name on LinkedIn and applications.",
            },
            {
              icon: <Shield className="h-5 w-5" />,
              title: "Admin verification",
              description:
                "Earn a verified badge after RCA review. Employers trust verified profiles first.",
            },
            {
              icon: <Briefcase className="h-5 w-5" />,
              title: "Project showcase",
              description:
                "Highlight tech stacks, live demos, and GitHub repos that prove what you can build.",
            },
            {
              icon: <MessageSquare className="h-5 w-5" />,
              title: "Direct messaging",
              description:
                "Chat with recruiters after accepting contact requests — no middleman needed.",
            },
            {
              icon: <Award className="h-5 w-5" />,
              title: "Certs & achievements",
              description:
                "Display certifications, hackathon wins, and awards alongside your projects.",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "Career analytics",
              description:
                "Track profile views, response rates, and completeness to improve your visibility.",
            },
          ]}
        />

        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold">Your path to opportunity</h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
              Four steps from sign-up to your first employer conversation
            </p>
            <div className="mt-12 space-y-0">
              {STEPS.map((step, i) => (
                <div key={step.num} className="relative flex gap-6 pb-10 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-5 top-12 h-full w-px bg-border" />
                  )}
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {step.num}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MarketingCTA
          title="Your next opportunity is waiting"
          description="Join RCA Talent free — build your portfolio and connect with employers today."
          button={
            <Button size="lg" variant="secondary" className="rounded-full px-10" asChild>
              <Link href="/register?role=student">
                Get started free
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
