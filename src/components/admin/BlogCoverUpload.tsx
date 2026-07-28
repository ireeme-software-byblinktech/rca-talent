"use client";

import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { filesApi } from "@/lib/api/files";
import { resolveMediaUrl } from "@/lib/config/env";
import { cn } from "@/lib/utils";

interface BlogCoverUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export function BlogCoverUpload({ value, onChange, className }: BlogCoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverUrl = resolveMediaUrl(value);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const uploaded = await filesApi.uploadBlogCover(file);
      onChange(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Cover image</Label>
      <div className="relative overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/20">
        {coverUrl ? (
          <div className="relative aspect-[21/9]">
            <Image
              src={coverUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute right-3 top-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-full bg-white/90"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                Replace
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90"
                onClick={() => onChange(undefined)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">Upload cover image</span>
                <span className="text-xs">JPEG, PNG, WEBP, GIF · max 5MB</span>
              </>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
