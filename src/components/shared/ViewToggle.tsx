"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "table";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border/60 bg-secondary/50 p-1",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          value === "cards"
            ? "bg-card text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Cards
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          value === "table"
            ? "bg-card text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Table2 className="h-4 w-4" />
        Table
      </button>
    </div>
  );
}
