import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Globe,
  GraduationCap,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroBackground } from "./MarketingSections";
import { LandingHeroVisual } from "./HeroVisuals";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.03] via-background to-background">
      <HeroBackground />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:pb-24 lg:pt-20">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <div className="animate-fade-up opacity-0 mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="h-4 w-4" />
            Rwanda Coding Academy · Talent Marketplace
          </div>

          <h1 className="animate-fade-up stagger-1 opacity-0 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] leading-[1.08] text-balance">
            Where RCA graduates meet{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                their next role
              </span>
            </span>
          </h1>

          <p className="animate-fade-up stagger-2 opacity-0 mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed lg:mx-0">
            Build a verified portfolio, get discovered by employers, and hire Rwanda&apos;s
            best emerging developers — all on one trusted platform.
          </p>

          <div className="animate-fade-up stagger-3 opacity-0 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button size="lg" className="h-12 rounded-full px-8 shadow-elevated gap-2" asChild>
              <Link href="/register?role=student">
                <GraduationCap className="h-4 w-4" />
                I&apos;m a Student
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-8 bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5"
              asChild
            >
              <Link href="/register?role=company">
                <Building2 className="h-4 w-4 mr-2" />
                I&apos;m a Company
              </Link>
            </Button>
          </div>

          <div className="animate-fade-up stagger-4 opacity-0 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start">
            {[
              { value: "120+", label: "Students" },
              { value: "45+", label: "Companies" },
              { value: "95%", label: "Verified" },
            ].map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="animate-fade-up stagger-2 opacity-0 mt-12 lg:mt-0">
          <LandingHeroVisual />
        </div>
      </div>
    </section>
  );
}

interface AudienceCardProps {
  href: string;
  variant: "student" | "company";
  icon: React.ReactNode;
  title: string;
  description: string;
  features: { icon: React.ReactNode; text: string }[];
  cta: string;
  stat?: string;
}

function AudienceCard({
  href,
  variant,
  icon,
  title,
  description,
  features,
  cta,
  stat,
}: AudienceCardProps) {
  const isStudent = variant === "student";

  return (
    <Link href={href} className="group block h-full">
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-card shadow-card transition-all duration-500",
          "hover:-translate-y-1 hover:shadow-elevated hover:border-primary/25"
        )}
      >
        {/* Gradient header */}
        <div
          className={cn(
            "relative px-8 pb-16 pt-8 sm:px-10 sm:pt-10",
            isStudent
              ? "bg-gradient-to-br from-violet-600 via-primary to-accent"
              : "bg-gradient-to-br from-slate-800 via-primary to-accent"
          )}
        >
          <div className="landing-grid absolute inset-0 opacity-10" />
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-110" />
          <div className="relative flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              {icon}
            </div>
            {stat && (
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {stat}
              </span>
            )}
          </div>
          <h3 className="relative mt-6 text-2xl font-bold text-white sm:text-[1.75rem]">
            {title}
          </h3>
        </div>

        {/* Body — overlaps header */}
        <div className="relative -mt-10 flex flex-1 flex-col rounded-t-3xl bg-card px-8 pb-8 pt-6 sm:px-10 sm:pb-10">
          <p className="text-muted-foreground leading-relaxed">{description}</p>

          <ul className="mt-6 flex-1 space-y-3">
            {features.map((f) => (
              <li key={f.text} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                    isStudent ? "bg-violet-500/10 text-violet-700" : "bg-primary/10 text-primary"
                  )}
                >
                  {f.icon}
                </span>
                <span className="text-foreground/90">{f.text}</span>
              </li>
            ))}
          </ul>

          <div
            className={cn(
              "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-300",
              isStudent
                ? "bg-primary text-primary-foreground group-hover:gap-3 group-hover:shadow-md"
                : "border-2 border-primary text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:gap-3"
            )}
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export function AudienceCardsSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-muted/20" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Choose your path
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Built for students and employers alike
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Whether you&apos;re launching your career or building your team, RCA Talent
            has the tools you need.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <AudienceCard
            href="/for-students"
            variant="student"
            icon={<GraduationCap className="h-7 w-7" />}
            title="For Students"
            stat="Free forever"
            description="Build your brand, publish a portfolio, and get discovered by employers actively hiring RCA graduates."
            features={[
              { icon: <Globe className="h-3.5 w-3.5" />, text: "Professional portfolio builder with custom URL" },
              { icon: <Shield className="h-3.5 w-3.5" />, text: "Admin-verified badge for credibility" },
              { icon: <MessageSquare className="h-3.5 w-3.5" />, text: "Direct messaging with recruiters" },
              { icon: <Briefcase className="h-3.5 w-3.5" />, text: "Career analytics & project showcase" },
            ]}
            cta="Explore for students"
          />
          <AudienceCard
            href="/for-companies"
            variant="company"
            icon={<Building2 className="h-7 w-7" />}
            title="For Companies"
            stat="Verified talent"
            description="Search verified profiles, review real project work, and manage your entire hiring pipeline in one dashboard."
            features={[
              { icon: <Search className="h-3.5 w-3.5" />, text: "Advanced skill, cohort & availability filters" },
              { icon: <Users className="h-3.5 w-3.5" />, text: "Job postings & interview invitations" },
              { icon: <Bookmark className="h-3.5 w-3.5" />, text: "Bookmark and track promising candidates" },
              { icon: <CheckCircle2 className="h-3.5 w-3.5" />, text: "Portfolio-first hiring — see work before you reach out" },
            ]}
            cta="Explore for companies"
          />
        </div>
      </div>
    </section>
  );
}
