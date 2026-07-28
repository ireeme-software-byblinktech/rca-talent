"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Globe, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { SKILL_OPTIONS } from "@/lib/mock/data";
import { isRenderableImageUrl } from "@/lib/utils";
import type { Project } from "@/types";

const optionalUrl = z
  .string()
  .optional()
  .refine(
    (v) => !v?.trim() || z.string().url().safeParse(v.trim()).success,
    { message: "Enter a valid URL (including https://)" }
  );

const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  demo: optionalUrl,
  repo: optionalUrl,
  // Optional — invalid values are cleared on submit instead of blocking create
  coverImage: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

interface ProjectFormDialogProps {
  project?: Project;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

export function ProjectFormDialog({ project, onClose, onSuccess }: ProjectFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [techStack, setTechStack] = useState<string[]>(project?.techStack ?? []);
  const [submitForReview, setSubmitForReview] = useState<boolean>(
    project ? project.publishStatus !== "private" && project.publishStatus !== "rejected" : false
  );

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          description: project.description,
          demo: project.links?.demo ?? "",
          repo: project.links?.repo ?? "",
          coverImage: project.images?.[0] ?? "",
        }
      : {
          title: "",
          description: "",
          demo: "",
          repo: "",
          coverImage: "",
        },
  });

  const mutation = useMutation({
    mutationFn: (data: ProjectForm) => {
      const cover = (data.coverImage ?? "").trim();
      const validCover =
        cover && isRenderableImageUrl(cover) ? cover : undefined;

      if (cover && !validCover) {
        toast({
          title: "Cover image skipped",
          description:
            "Use a direct image link (ending in .jpg, .png, .webp) or leave it blank.",
        });
      }

      const payload = {
        title: data.title,
        description: data.description,
        techStack,
        links: {
          demo: data.demo?.trim() || undefined,
          repo: data.repo?.trim() || undefined,
        },
        images: validCover ? [validCover] : project?.images,
        submitForReview,
      };
      return project
        ? studentsApi.updateProject(user!.id, project.id, payload)
        : studentsApi.createProject(user!.id, payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
      queryClient.invalidateQueries({ queryKey: ["public-portfolio"] });
      toast({ title: project ? "Project updated" : "Project created" });
      onSuccess?.(result);
      onClose();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save project",
      });
    },
  });

  const errors = form.formState.errors;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(
        (d) => mutation.mutate(d),
        (fieldErrors) => {
          const first =
            fieldErrors.title?.message ||
            fieldErrors.description?.message ||
            fieldErrors.demo?.message ||
            fieldErrors.repo?.message ||
            "Please fix the highlighted fields.";
          toast({
            variant: "destructive",
            title: "Cannot create project",
            description: first,
          });
        }
      )}
      className="flex max-h-[min(70vh,32rem)] flex-col gap-4 overflow-y-auto pr-1"
    >
      <div className="space-y-2">
        <Label htmlFor="project-title">Title</Label>
        <Input id="project-title" {...form.register("title")} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Textarea id="project-description" rows={3} {...form.register("description")} />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-cover">Cover image URL (optional)</Label>
        <Input
          id="project-cover"
          placeholder="https://…/image.jpg"
          {...form.register("coverImage")}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank if you don&apos;t have one. Must be a direct image link.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Tech stack</Label>
        <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
          {SKILL_OPTIONS.map((skill) => (
            <Badge
              key={skill}
              variant={techStack.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setTechStack((prev) =>
                  prev.includes(skill)
                    ? prev.filter((s) => s !== skill)
                    : [...prev, skill]
                )
              }
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-demo">Demo URL</Label>
        <Input
          id="project-demo"
          placeholder="https://..."
          {...form.register("demo")}
        />
        {errors.demo && (
          <p className="text-xs text-destructive">{errors.demo.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-repo">Repository URL</Label>
        <Input
          id="project-repo"
          placeholder="https://github.com/..."
          {...form.register("repo")}
        />
        {errors.repo && (
          <p className="text-xs text-destructive">{errors.repo.message}</p>
        )}
      </div>

      {/* ── Publish for Company Discovery Toggle ───────────────────────── */}
      <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="submit-for-review" className="font-bold text-sm text-foreground cursor-pointer">
                  Publish for Company Discovery
                </Label>
                <Badge variant="default" className="text-[10px] px-2 py-0 bg-primary/90">
                  Optional
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Request admin review to showcase this project to hiring employers
              </p>
            </div>
          </div>
          <Switch
            id="submit-for-review"
            checked={submitForReview}
            onCheckedChange={setSubmitForReview}
          />
        </div>

        <div className="rounded-lg bg-background/80 p-3 text-xs border leading-relaxed">
          {submitForReview ? (
            <div className="flex items-start gap-2 text-primary font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Company Verification Enabled:</strong> Saving will submit this project to RCA Talent admins. Once approved, hiring companies can discover this project and view your profile directly!
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 text-muted-foreground/70 shrink-0 mt-0.5" />
              <span>
                <strong>Standard Portfolio Mode (Off):</strong> Saves directly to your portfolio as a standard project. Turn the toggle ON above whenever you want companies to discover this project.
              </span>
            </div>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {project ? "Update project" : "Create project"}
      </Button>
    </form>
  );
}
