"use client";

import Image from "next/image";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { filesApi } from "@/lib/api/files";
import { resolveMediaUrl } from "@/lib/config/env";
import { cn, isRenderableImageUrl, shouldUnoptimizeImage } from "@/lib/utils";

interface ProjectCoverUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export function ProjectCoverUpload({
  value,
  onChange,
  className,
}: ProjectCoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value ?? "");

  useEffect(() => {
    setUrlInput(value ?? "");
  }, [value]);

  const coverUrl = resolveMediaUrl(value?.trim() || undefined);
  const previewUrl =
    coverUrl && isRenderableImageUrl(coverUrl) ? coverUrl : undefined;

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const uploaded = await filesApi.uploadProjectCover(file);
      onChange(uploaded.url);
      setUrlInput(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (nextValue: string) => {
    setUrlInput(nextValue);
    setError(null);
    const trimmed = nextValue.trim();
    if (!trimmed) {
      onChange(undefined);
      return;
    }
    if (!isRenderableImageUrl(trimmed)) {
      setError(
        "Use a direct image link (e.g. ending in .jpg or .png) or upload from your computer."
      );
      return;
    }
    onChange(trimmed);
  };

  const clearCover = () => {
    setUrlInput("");
    setError(null);
    onChange(undefined);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Cover image (optional)</Label>
      <div className="relative overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/20">
        {previewUrl ? (
          <div className="relative aspect-[16/9]">
            <Image
              src={previewUrl}
              alt="Project cover preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized={shouldUnoptimizeImage(previewUrl)}
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
                onClick={clearCover}
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
            className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">Upload from your computer</span>
                <span className="text-xs">JPEG, PNG, WEBP, GIF · max 5MB</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="Or paste an image URL"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 rounded-full"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Upload a screenshot or paste a direct image link. Leave blank to use the default cover.
      </p>

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
