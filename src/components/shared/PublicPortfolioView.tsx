"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Award,
  CheckCircle2,
  Code2,
  FolderKanban,
  GraduationCap,
  Link2,
  Mail,
  Pencil,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AchievementCard, CertificationCard } from "@/components/shared/CredentialCard";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { RCALogo } from "@/components/shared/RCALogo";
import { cn } from "@/lib/utils";
import type { PortfolioSections, PortfolioTheme, PublicPortfolio } from "@/types";

interface PublicPortfolioViewProps {
  portfolio: PublicPortfolio;
  preview?: boolean;
  onEditSection?: (section: "hero" | keyof PortfolioSections) => void;
}

const themeConfig: Record<
  PortfolioTheme,
  { page: string; hero: string; heroText: string; heroMuted: string; section: string }
> = {
  modern: {
    page: "bg-gradient-to-b from-primary/[0.04] via-background to-background",
    hero: "bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground",
    heroText: "text-primary-foreground",
    heroMuted: "text-primary-foreground/75",
    section: "border-primary/10",
  },
  classic: {
    page: "bg-background",
    hero: "bg-card border-b border-border",
    heroText: "text-foreground",
    heroMuted: "text-muted-foreground",
    section: "border-border",
  },
  minimal: {
    page: "bg-muted/20",
    hero: "bg-transparent",
    heroText: "text-foreground",
    heroMuted: "text-muted-foreground",
    section: "border-border/60",
  },
};

function SectionHeading({
  icon,
  title,
  theme,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  theme: PortfolioTheme;
  onEdit?: () => void;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b pb-3", themeConfig[theme].section)}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-full text-xs text-muted-foreground hover:text-primary"
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      )}
    </div>
  );
}

const DEFAULT_SECTIONS: PortfolioSections = {
  about: true,
  skills: true,
  projects: true,
  certifications: true,
  achievements: true,
};

export function PublicPortfolioView({ portfolio, preview, onEditSection }: PublicPortfolioViewProps) {
  const { config, profile, projects, certifications, achievements } = portfolio;
  const theme: PortfolioTheme =
    config?.theme && themeConfig[config.theme] ? config.theme : "modern";
  const sections: PortfolioSections = {
    ...DEFAULT_SECTIONS,
    ...(config?.sections ?? {}),
  };
  const tagline = config?.tagline ?? "";
  const t = themeConfig[theme];
  const isDarkHero = theme === "modern";

  return (
    <div className={cn("min-h-full", preview ? "min-h-0" : "min-h-screen", t.page)}>
      {!preview && (
        <header className="sticky top-0 z-20 border-b border-border/60 bg-card/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <RCALogo size="sm" />
              <span className="hidden sm:inline">RCA Talent</span>
            </Link>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/register?role=student">Build yours</Link>
            </Button>
          </div>
        </header>
      )}

      {/* Hero */}
      <section className={cn("relative overflow-hidden", t.hero)}>
        {theme === "modern" && (
          <>
            <div className="landing-grid absolute inset-0 opacity-10" />
            <div className="animate-pulse-soft absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="animate-pulse-soft absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/5 blur-2xl [animation-delay:2s]" />
          </>
        )}
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          {onEditSection && (
            <div className="absolute right-4 top-4 z-10">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 gap-1 rounded-full bg-white/90 text-xs shadow-md backdrop-blur-sm"
                onClick={() => onEditSection("hero")}
              >
                <Pencil className="h-3 w-3" />
                Edit hero
              </Button>
            </div>
          )}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile.photoUrl ? (
                <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-elevated ring-4 ring-white/25">
                  <Image
                    src={profile.photoUrl}
                    alt={profile.fullName}
                    fill
                    className="object-cover"
                    unoptimized={profile.photoUrl.startsWith("/mock/")}
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-28 w-28 items-center justify-center rounded-full text-4xl font-bold shadow-elevated ring-4",
                    isDarkHero
                      ? "bg-white/15 text-white ring-white/25 backdrop-blur-sm"
                      : "bg-gradient-to-br from-primary to-accent text-white ring-primary/20"
                  )}
                >
                  {profile.fullName.charAt(0)}
                </div>
              )}
              {profile.verificationStatus === "approved" && (
                <span
                  className={cn(
                    "absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm",
                    isDarkHero ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  )}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>

            <h1 className={cn("mt-6 text-3xl font-bold tracking-tight sm:text-4xl", t.heroText)}>
              {profile.fullName}
            </h1>
            {tagline ? (
              <p className={cn("mt-3 max-w-xl text-lg leading-relaxed", t.heroMuted)}>
                {tagline}
              </p>
            ) : preview && onEditSection ? (
              <p className={cn("mt-3 max-w-xl text-lg italic opacity-60", t.heroMuted)}>
                Add a tagline in the editor
              </p>
            ) : null}
            <div className={cn("mt-3 flex items-center gap-2 text-sm", t.heroMuted)}>
              <GraduationCap className="h-4 w-4" />
              RCA Class of {profile.cohortYear}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {profile.availability.map((a) => (
                <Badge
                  key={a}
                  variant="secondary"
                  className={cn(
                    "capitalize",
                    isDarkHero && "border-white/20 bg-white/15 text-white hover:bg-white/20"
                  )}
                >
                  {a}
                </Badge>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {profile.links.github && (
                <Button
                  size="sm"
                  variant={isDarkHero ? "secondary" : "outline"}
                  className={cn("rounded-full", isDarkHero && "bg-white/15 text-white hover:bg-white/25 border-white/20")}
                  asChild
                >
                  <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
                    <Code2 className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}
              {profile.links.linkedin && (
                <Button
                  size="sm"
                  variant={isDarkHero ? "secondary" : "outline"}
                  className={cn("rounded-full", isDarkHero && "bg-white/15 text-white hover:bg-white/25 border-white/20")}
                  asChild
                >
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                    <Link2 className="mr-2 h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {profile.cvUrl && (
                <Button
                  size="sm"
                  variant={isDarkHero ? "secondary" : "outline"}
                  className={cn("rounded-full", isDarkHero && "bg-white/15 text-white hover:bg-white/25 border-white/20")}
                  asChild
                >
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-4 w-4" />
                    Download CV
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 space-y-14">
        {sections.about && (
          <section>
            <SectionHeading
              icon={<User className="h-4 w-4" />}
              title="About"
              theme={theme}
              onEdit={onEditSection ? () => onEditSection("about") : undefined}
            />
            {profile.bio ? (
              <p className="mt-5 text-muted-foreground leading-relaxed text-base">{profile.bio}</p>
            ) : preview && onEditSection ? (
              <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No bio yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1 rounded-full"
                  onClick={() => onEditSection("about")}
                >
                  <Pencil className="h-3 w-3" />
                  Add bio
                </Button>
              </div>
            ) : null}
          </section>
        )}

        {sections.skills && (
          <section>
            <SectionHeading
              icon={<Sparkles className="h-4 w-4" />}
              title="Skills"
              theme={theme}
              onEdit={onEditSection ? () => onEditSection("skills") : undefined}
            />
            {profile.skills.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="skill-pill text-sm px-3 py-1">
                    {skill}
                  </span>
                ))}
              </div>
            ) : preview && onEditSection ? (
              <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No skills selected</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1 rounded-full"
                  onClick={() => onEditSection("skills")}
                >
                  <Pencil className="h-3 w-3" />
                  Add skills
                </Button>
              </div>
            ) : null}
          </section>
        )}

        {sections.projects && (
          <section>
            <SectionHeading
              icon={<FolderKanban className="h-4 w-4" />}
              title="Projects"
              theme={theme}
              onEdit={onEditSection ? () => onEditSection("projects") : undefined}
            />
            {projects.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} readOnly />
                ))}
              </div>
            ) : preview && onEditSection ? (
              <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No projects yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1 rounded-full"
                  onClick={() => onEditSection("projects")}
                >
                  <Pencil className="h-3 w-3" />
                  Add project
                </Button>
              </div>
            ) : null}
          </section>
        )}

        {sections.certifications && (
          <section>
            <SectionHeading
              icon={<Award className="h-4 w-4" />}
              title="Certifications"
              theme={theme}
              onEdit={onEditSection ? () => onEditSection("certifications") : undefined}
            />
            {certifications.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {certifications.map((cert) => (
                  <CertificationCard key={cert.id} certification={cert} readOnly />
                ))}
              </div>
            ) : preview && onEditSection ? (
              <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No certifications yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1 rounded-full"
                  onClick={() => onEditSection("certifications")}
                >
                  <Pencil className="h-3 w-3" />
                  Add certification
                </Button>
              </div>
            ) : null}
          </section>
        )}

        {sections.achievements && (
          <section>
            <SectionHeading
              icon={<Trophy className="h-4 w-4" />}
              title="Achievements"
              theme={theme}
              onEdit={onEditSection ? () => onEditSection("achievements") : undefined}
            />
            {achievements.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {achievements.map((ach) => (
                  <AchievementCard key={ach.id} achievement={ach} readOnly />
                ))}
              </div>
            ) : preview && onEditSection ? (
              <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No achievements yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1 rounded-full"
                  onClick={() => onEditSection("achievements")}
                >
                  <Pencil className="h-3 w-3" />
                  Add achievement
                </Button>
              </div>
            ) : null}
          </section>
        )}
      </main>

      {!preview && (
        <footer className="border-t bg-card/50 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Portfolio built with{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              RCA Talent
            </Link>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rwanda Coding Academy · Verified talent marketplace
          </p>
        </footer>
      )}
    </div>
  );
}
