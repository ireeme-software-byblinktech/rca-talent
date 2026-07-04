"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { StudentWithUser } from "@/types";

interface TalentProfileCardProps {
  student: StudentWithUser;
  href: string;
  className?: string;
}

const GRADIENTS = [
  "from-primary/90 via-primary/70 to-accent/80",
  "from-accent/90 via-primary/60 to-primary/80",
  "from-primary/80 via-accent/70 to-primary/90",
];

export function TalentProfileCard({
  student,
  href,
  className,
}: TalentProfileCardProps) {
  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradientIndex =
    student.fullName.charCodeAt(0) % GRADIENTS.length;

  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <article className="fancy-card h-full overflow-hidden">
        <div
          className={cn(
            "relative h-24 bg-gradient-to-br",
            GRADIENTS[gradientIndex]
          )}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          <div className="absolute -bottom-8 left-5">
            <Avatar className="h-16 w-16 ring-4 ring-card shadow-elevated">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-5 pt-10">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {student.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                RCA Class of {student.cohortYear}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0 mt-1" />
          </div>

          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {student.bio || "No bio yet"}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {student.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="skill-pill">
                {skill}
              </span>
            ))}
            {student.skills.length > 3 && (
              <span className="skill-pill skill-pill-muted">
                +{student.skills.length - 3}
              </span>
            )}
          </div>

          {student.availability.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap gap-1.5">
              {student.availability.map((a) => (
                <Badge
                  key={a}
                  variant="outline"
                  className="text-[10px] uppercase tracking-wide font-semibold capitalize border-primary/20 text-primary/80"
                >
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
