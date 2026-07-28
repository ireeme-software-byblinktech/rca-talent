"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PortfolioCvDownloadButtonProps {
  slug: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
}

function parseFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return fallback;
    }
  }
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? fallback;
}

export function PortfolioCvDownloadButton({
  slug,
  className,
  variant = "outline",
}: PortfolioCvDownloadButtonProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!slug || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/p/${encodeURIComponent(slug)}/cv`, {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 404) {
        toast({
          title: "CV unavailable",
          description: "This student has not uploaded a CV, or the file is no longer available.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        toast({
          title: "Download failed",
          description: "We could not download the CV. Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      const blob = await response.blob();
      const filename = parseFilename(
        response.headers.get("Content-Disposition"),
        `${slug}-CV.pdf`
      );
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast({
        title: "Download failed",
        description: "We could not download the CV. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className={cn("rounded-full", className)}
      onClick={handleDownload}
      disabled={isDownloading}
      aria-busy={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      {isDownloading ? "Downloading…" : "Download CV"}
    </Button>
  );
}
