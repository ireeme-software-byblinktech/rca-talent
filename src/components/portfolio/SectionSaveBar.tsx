"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionSaveBarProps {
  label: string;
  dirty?: boolean;
  saving?: boolean;
  onSave: () => void;
  className?: string;
}

export function SectionSaveBar({
  label,
  dirty = false,
  saving = false,
  onSave,
  className,
}: SectionSaveBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 -mx-5 -mb-5 mt-4 flex items-center justify-between gap-3 border-t bg-card/95 px-5 py-3 backdrop-blur-sm",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">
        {dirty ? "Unsaved changes" : "All changes saved"}
      </p>
      <Button
        size="sm"
        className="gap-1.5 rounded-full"
        onClick={onSave}
        disabled={saving || !dirty}
        variant={dirty ? "default" : "secondary"}
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}
        {label}
      </Button>
    </div>
  );
}
