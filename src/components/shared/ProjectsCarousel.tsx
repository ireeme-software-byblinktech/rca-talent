"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectsCarouselProps {
  projects: Project[];
  className?: string;
}

export function ProjectsCarousel({ projects, className }: ProjectsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [projects, updateArrows]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const amount = card ? card.offsetWidth + 20 : el.clientWidth * 0.85;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (projects.length === 0) {
    return <p className="text-muted-foreground text-sm">No projects listed.</p>;
  }

  return (
    <div className={cn("relative", className)}>
      {canPrev && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous projects"
          className="absolute left-0 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-md border"
          onClick={() => scrollByCard(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {canNext && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next projects"
          className="absolute right-0 top-1/2 z-10 h-10 w-10 translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-md border"
          onClick={() => scrollByCard(1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project) => (
          <div
            key={project.id}
            data-carousel-item
            className="w-[min(100%,320px)] shrink-0 snap-start sm:w-[340px]"
          >
            <ProjectCard project={project} readOnly className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
