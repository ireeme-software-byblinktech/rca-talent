"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { certificationsApi } from "@/lib/api/certifications";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import type { Certification } from "@/types";

const MOCK_CERT_IMAGES = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
];

const certSchema = z.object({
  title: z.string().min(2),
  issuer: z.string().min(2),
  issueDate: z.string().min(1),
  credentialUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type CertForm = z.infer<typeof certSchema>;

interface CertificationFormDialogProps {
  certification?: Certification | null;
  onClose: () => void;
  onSuccess?: (certification: Certification) => void;
}

export function CertificationFormDialog({
  certification,
  onClose,
  onSuccess,
}: CertificationFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    certification?.imageUrl ?? null
  );

  const form = useForm<CertForm>({
    resolver: zodResolver(certSchema),
    defaultValues: certification
      ? {
          title: certification.title,
          issuer: certification.issuer,
          issueDate: certification.issueDate,
          credentialUrl: certification.credentialUrl ?? "",
          imageUrl: certification.imageUrl ?? "",
        }
      : undefined,
  });

  useEffect(() => {
    if (certification) {
      setImagePreview(certification.imageUrl ?? null);
      form.reset({
        title: certification.title,
        issuer: certification.issuer,
        issueDate: certification.issueDate,
        credentialUrl: certification.credentialUrl ?? "",
        imageUrl: certification.imageUrl ?? "",
      });
    }
  }, [certification, form]);

  const mutation = useMutation({
    mutationFn: (data: CertForm) => {
      const payload = {
        title: data.title,
        issuer: data.issuer,
        issueDate: data.issueDate,
        credentialUrl: data.credentialUrl || undefined,
        imageUrl: data.imageUrl || imagePreview || undefined,
      };
      return certification
        ? certificationsApi.update(user!.id, certification.id, payload)
        : certificationsApi.create(user!.id, payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["student-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      toast({ title: certification ? "Certification updated" : "Certification added" });
      onSuccess?.(result);
      onClose();
    },
  });

  const mockThumbnailUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null || p >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
          const mockUrl =
            MOCK_CERT_IMAGES[Math.floor(Math.random() * MOCK_CERT_IMAGES.length)];
          setImagePreview(mockUrl);
          form.setValue("imageUrl", mockUrl);
          toast({ title: "Thumbnail uploaded" });
          return null;
        }
        return p + 25;
      });
    }, 150);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setImagePreview(URL.createObjectURL(file));
    mockThumbnailUpload();
    e.target.value = "";
  };

  const watchedImageUrl = form.watch("imageUrl");
  const displayThumbnail = imagePreview || watchedImageUrl || null;

  return (
    <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div>
        <Label>Thumbnail image</Label>
        <div className="mt-2 rounded-xl border border-dashed border-border/60 bg-muted/30 p-4">
          {displayThumbnail ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={displayThumbnail}
                alt="Certificate thumbnail"
                fill
                className="object-cover"
                unoptimized={displayThumbnail.startsWith("blob:")}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">Upload certificate image</p>
            </div>
          )}
          {uploadProgress !== null && <Progress value={uploadProgress} className="mt-3 h-1.5" />}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress !== null}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            {displayThumbnail && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImagePreview(null);
                  form.setValue("imageUrl", "");
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <Input
          {...form.register("imageUrl")}
          placeholder="Or paste image URL"
          className="mt-2"
          onChange={(e) => {
            const value = e.target.value;
            form.setValue("imageUrl", value);
            if (value) setImagePreview(value);
          }}
        />
      </div>
      <div>
        <Label>Title</Label>
        <Input {...form.register("title")} placeholder="AWS Cloud Practitioner" />
      </div>
      <div>
        <Label>Issuer</Label>
        <Input {...form.register("issuer")} placeholder="Amazon Web Services" />
      </div>
      <div>
        <Label>Issue Date</Label>
        <Input type="date" {...form.register("issueDate")} />
      </div>
      <div>
        <Label>Credential URL (optional)</Label>
        <Input {...form.register("credentialUrl")} placeholder="https://..." />
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending || uploadProgress !== null}
        className="w-full"
      >
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {certification ? "Save changes" : "Add certification"}
      </Button>
    </form>
  );
}
