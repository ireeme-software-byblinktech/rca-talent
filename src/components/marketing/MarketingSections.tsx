import { cn } from "@/lib/utils";

export function HeroBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="landing-grid absolute inset-0 opacity-40" />
      <div className="marketing-hero-glow absolute inset-0" />
      <div className="animate-pulse-soft absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="animate-pulse-soft absolute -right-16 top-40 h-64 w-64 rounded-full bg-accent/15 blur-3xl [animation-delay:1.5s]" />
      <div className="animate-pulse-soft absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-primary/8 blur-2xl [animation-delay:3s]" />
    </div>
  );
}

interface PageHeroProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description: string;
  actions?: React.ReactNode;
  visual?: React.ReactNode;
  centered?: boolean;
}

export function PageHero({
  badge,
  title,
  description,
  actions,
  visual,
  centered = false,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b">
      <HeroBackground />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div
          className={cn(
            "grid items-center gap-12 lg:gap-16",
            visual ? "lg:grid-cols-2" : "",
            centered && !visual && "mx-auto max-w-3xl text-center"
          )}
        >
          <div className={cn(centered && !visual && "flex flex-col items-center")}>
            {badge && (
              <div className="animate-fade-up opacity-0 mb-6 inline-flex">{badge}</div>
            )}
            <h1 className="animate-fade-up stagger-1 opacity-0 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] leading-[1.1] text-balance">
              {title}
            </h1>
            <p className="animate-fade-up stagger-2 opacity-0 mt-5 text-lg text-muted-foreground leading-relaxed text-balance">
              {description}
            </p>
            {actions && (
              <div className="animate-fade-up stagger-3 opacity-0 mt-8 flex flex-wrap gap-3">
                {actions}
              </div>
            )}
          </div>
          {visual && (
            <div className="animate-fade-up stagger-2 opacity-0 relative hidden lg:block">
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureGrid({
  title,
  subtitle,
  items,
  columns = 2,
}: {
  title: string;
  subtitle?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
}) {
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("mt-12 grid gap-5", colClass)}>
          {items.map((item) => (
            <article
              key={item.title}
              className="group fancy-card p-6 sm:p-7"
            >
              <div className="feature-icon-wrap">{item.icon}</div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsStrip({ stats }: { stats: { value: string; label: string }[] }) {
  const doubled = [...stats, ...stats];
  return (
    <section className="border-y bg-primary py-5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((stat, i) => (
          <div
            key={`${stat.label}-${i}`}
            className="mx-10 flex shrink-0 items-baseline gap-2"
          >
            <span className="text-2xl font-bold text-primary-foreground">{stat.value}</span>
            <span className="text-sm text-primary-foreground/70">{stat.label}</span>
            <span className="mx-6 text-primary-foreground/30">·</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MarketingCTA({
  title,
  description,
  button,
}: {
  title: string;
  description: string;
  button: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
      <div className="landing-grid absolute inset-0 opacity-10" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
          {title}
        </h2>
        <p className="mt-4 text-primary-foreground/80 leading-relaxed">{description}</p>
        <div className="mt-8">{button}</div>
      </div>
    </section>
  );
}

export function SkillMarquee({ skills }: { skills: string[] }) {
  const doubled = [...skills, ...skills];
  return (
    <section className="border-y bg-muted/40 py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((skill, i) => (
          <span key={`${skill}-${i}`} className="mx-3 skill-pill shrink-0">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
