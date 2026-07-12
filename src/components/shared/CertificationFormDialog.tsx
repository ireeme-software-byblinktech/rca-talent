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
import { filesApi } from "@/lib/api/files";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { isRenderableImageUrl } from "@/lib/utils";
import type { Certification } from "@/types";

const certSchema = z.object({
  title: z.string().min(2, "Title is required"),
  issuer: z.string().min(2, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  // Optional — invalid values are cleared on submit instead of blocking save
  credentialUrl: z.string().optional(),
  imageUrl: z.string().optional(),
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
      : {
          title: "",
          issuer: "",
          issueDate: "",
          credentialUrl: "",
          imageUrl: "",
        },
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

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const mutation = useMutation({
    mutationFn: (data: CertForm) => {
      const pasted = (data.imageUrl ?? "").trim();
      const preview = imagePreview?.startsWith("blob:") ? "" : imagePreview;
      const candidate = pasted || preview || "";
      const imageUrl =
        candidate && isRenderableImageUrl(candidate) ? candidate : undefined;

      const credential = (data.credentialUrl ?? "").trim();
      const credentialUrl =
        credential && z.string().url().safeParse(credential).success
          ? credential
          : undefined;
      if (credential && !credentialUrl) {
        toast({
          title: "Credential URL skipped",
          description:
            "Enter a full URL starting with https://, or leave it blank.",
        });
      }

      const payload = {
        title: data.title,
        issuer: data.issuer,
        issueDate: data.issueDate,
        credentialUrl,
        imageUrl,
      };
      return certification
        ? certificationsApi.update(user!.id, certification.id, payload)
        : certificationsApi.create(user!.id, payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["student-certifications"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      toast({
        title: certification ? "Certification updated" : "Certification added",
      });
      onSuccess?.(result);
      onClose();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save certification",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please choose an image (JPEG, PNG, or WEBP).",
      });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setUploadProgress(20);

    try {
      const uploaded = await filesApi.uploadProfilePhoto(file);
      setUploadProgress(100);
      if (localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      setImagePreview(uploaded.url);
      form.setValue("imageUrl", uploaded.url, { shouldValidate: true });
      toast({ title: "Image uploaded" });
    } catch (err) {
      if (localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      setImagePreview(form.getValues("imageUrl") || null);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Could not upload image",
      });
    } finally {
      setUploadProgress(null);
    }
  };

  const watchedImageUrl = form.watch("imageUrl");
  const displayThumbnail = imagePreview || watchedImageUrl || null;
  const errors = form.formState.errors;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(
        (d) => mutation.mutate(d),
        (fieldErrors) => {
          const first =
            fieldErrors.title?.message ||
            fieldErrors.issuer?.message ||
            fieldErrors.issueDate?.message ||
            fieldErrors.credentialUrl?.message ||
            "Please fix the highlighted fields.";
          toast({
            variant: "destructive",
            title: "Cannot save certification",
            description: first,
          });
        }
      )}
      className="flex max-h-[min(70vh,36rem)] flex-col gap-4 overflow-y-auto pr-1"
    >
      <div>
        <Label>Thumbnail image</Label>
        <div className="mt-2 rounded-xl border border-dashed border-border/60 bg-muted/30 p-4">
          {displayThumbnail ? (
            <div className="relative mx-auto aspect-[4/3] max-h-36 w-full overflow-hidden rounded-lg">
              <Image
                src={displayThumbnail}
                alt="Certificate thumbnail"
                fill
                className="object-cover"
                unoptimized={
                  displayThumbnail.startsWith("blob:") ||
                  displayThumbnail.includes("onrender.com")
                }
              />
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">
                Upload certificate image
              </p>
            </div>
          )}
          {uploadProgress !== null && (
            <Progress value={uploadProgress} className="mt-3 h-1.5" />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
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
                  if (imagePreview?.startsWith("blob:")) {
                    URL.revokeObjectURL(imagePreview);
                  }
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
            setImagePreview(value || null);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input {...form.register("title")} placeholder="AWS Cloud Practitioner" />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Issuer</Label>
        <Input {...form.register("issuer")} placeholder="Amazon Web Services" />
        {errors.issuer && (
          <p className="text-xs text-destructive">{errors.issuer.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Issue Date</Label>
        <Input type="date" {...form.register("issueDate")} />
        {errors.issueDate && (
          <p className="text-xs text-destructive">{errors.issueDate.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Credential URL (optional)</Label>
        <Input
          {...form.register("credentialUrl")}
          placeholder="https://..."
        />
        {errors.credentialUrl && (
          <p className="text-xs text-destructive">
            {errors.credentialUrl.message}
          </p>
        )}
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
