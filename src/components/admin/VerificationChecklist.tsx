import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationCheckItem } from "@/lib/verification-utils";

interface VerificationChecklistProps {
  items: VerificationCheckItem[];
  title?: string;
  className?: string;
}

export function VerificationChecklist({
  items,
  title = "Review checklist",
  className,
}: VerificationChecklistProps) {
  const metCount = items.filter((i) => i.met).length;
  const score = Math.round((metCount / items.length) * 100);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-muted/20 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            score >= 80 && "bg-emerald-500/10 text-emerald-700",
            score >= 50 && score < 80 && "bg-amber-500/10 text-amber-700",
            score < 50 && "bg-rose-500/10 text-rose-700"
          )}
        >
          {score}% complete
        </span>
      </div>
      <ul className="divide-y divide-border/40">
        {items.map((item) => (
          <li key={item.label} className="flex gap-3 px-4 py-3">
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                item.met ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {item.met ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                <Circle className="h-2 w-2 fill-current" />
              )}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  item.met ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </p>
              {!item.met && item.hint && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
