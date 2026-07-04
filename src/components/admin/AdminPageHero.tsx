import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AdminPageHeroProps {
  title: string;
  description: string;
  icon: LucideIcon;
  metrics?: { label: string; value: string | number; tone?: string }[];
  children?: React.ReactNode;
  className?: string;
}

export function AdminPageHero({
  title,
  description,
  icon: Icon,
  metrics = [],
  children,
  className,
}: AdminPageHeroProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 landing-grid opacity-[0.04]" />

      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Admin · Verification
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground font-sans">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
      </div>

      {metrics.length > 0 && (
        <div className="relative grid border-t border-border/50 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="border-b border-border/40 px-6 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <p className={cn("text-xs font-medium", m.tone ?? "text-muted-foreground")}>
                {m.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
