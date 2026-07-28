"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import {
  announcementsApi,
  type AnnouncementContext,
} from "@/lib/api/announcements";
import { useAuth } from "@/lib/auth/context";
import type { SiteAnnouncement } from "@/types";
import { cn } from "@/lib/utils";

function resolveContext(
  pathname: string,
  role?: string | null
): AnnouncementContext {
  if (role === "student") return "student";
  if (role === "company") return "company";
  if (pathname.startsWith("/for-students") || pathname.startsWith("/student")) {
    return "student";
  }
  if (pathname.startsWith("/for-companies") || pathname.startsWith("/company")) {
    return "company";
  }
  return "all";
}

function TickerItem({ item }: { item: SiteAnnouncement }) {
  const content = (
    <span className="inline-flex items-center gap-3 px-8">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d]" />
      <span>{item.message}</span>
    </span>
  );

  if (item.linkUrl) {
    return (
      <Link
        href={item.linkUrl}
        className="inline-flex items-center hover:underline underline-offset-2"
        target={item.linkUrl.startsWith("http") ? "_blank" : undefined}
        rel={item.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }

  return content;
}

interface BreakingNewsTickerProps {
  className?: string;
}

export function BreakingNewsTicker({ className }: BreakingNewsTickerProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const context = resolveContext(pathname, user?.role);

  const { data: announcements = [] } = useQuery({
    queryKey: ["site-announcements", context],
    queryFn: () => announcementsApi.listPublished(context),
    refetchInterval: 60_000,
  });

  if (announcements.length === 0) return null;

  const loop = [...announcements, ...announcements, ...announcements];

  return (
    <div
      className={cn(
        "relative z-[60] overflow-hidden border-b border-amber-500/20 bg-gradient-to-r from-[#0F1A2E] via-[#1A2B4B] to-[#0F1A2E]",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="flex shrink-0 items-center gap-2 border-r border-white/10 bg-amber-500 px-3 py-2 sm:px-4">
          <Megaphone className="h-3.5 w-3.5 text-[#1A2B4B]" aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2B4B] sm:text-xs">
            New
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden py-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#1A2B4B] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#1A2B4B] to-transparent" />

          <div className="flex animate-marquee whitespace-nowrap text-xs font-medium tracking-wide text-white/95 sm:text-sm">
            {loop.map((item, index) => (
              <TickerItem key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
