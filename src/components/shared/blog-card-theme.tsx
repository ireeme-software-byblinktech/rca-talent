import { cn } from "@/lib/utils";

/** Subtle brand fallback when no cover image is set */
export const BLOG_COVER_FALLBACK = "from-[#1A2B4B] to-[#2A4070]" as const;

export function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function BlogCardFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card",
        "transition-all duration-300 hover:border-primary/15 hover:shadow-elevated",
        className
      )}
    >
      {children}
    </article>
  );
}
