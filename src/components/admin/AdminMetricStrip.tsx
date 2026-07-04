import { cn } from "@/lib/utils";

export interface AdminMetric {
  label: string;
  value: string | number;
  color?: string;
}

interface AdminMetricStripProps {
  metrics: AdminMetric[];
  className?: string;
}

export function AdminMetricStrip({ metrics, className }: AdminMetricStripProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {metrics.map((m) => (
        <div
          key={m.label}
          className="fancy-card rounded-2xl border border-border/50 p-4 !translate-y-0 !shadow-card"
        >
          <p className={cn("text-sm font-medium", m.color ?? "text-primary")}>
            ● {m.label}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{m.value}</p>
        </div>
      ))}
    </div>
  );
}
