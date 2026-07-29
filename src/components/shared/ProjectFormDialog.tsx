"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Globe, Sparkles, CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ProjectCoverUpload } from "@/components/shared/ProjectCoverUpload";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { SKILL_OPTIONS } from "@/lib/mock/data";
import {
  MAX_CUSTOM_SKILL_LENGTH,
  buildListedSkillsMap,
  mergeSkillOptions,
  normalizeSkillName,
  sanitizeSkillList,
  skillsEqual,
} from "@/lib/skills/utils";
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
  const [techStack, setTechStack] = useState<string[]>(() =>
    sanitizeSkillList(project?.techStack)
  );
  const [customTech, setCustomTech] = useState("");
  const [submitForReview, setSubmitForReview] = useState<boolean>(
    project ? project.publishStatus !== "private" && project.publishStatus !== "rejected" : false
  );
  const [coverImage, setCoverImage] = useState<string | undefined>(
    project?.images?.[0]
  );

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          description: project.description,
          demo: project.links?.demo ?? "",
          repo: project.links?.repo ?? "",
        }
      : {
          title: "",
          description: "",
          demo: "",
          repo: "",
        },
  });

  const techOptions = useMemo(
    () => mergeSkillOptions(SKILL_OPTIONS, techStack),
    [techStack]
  );

  const listedTech = useMemo(
    () => buildListedSkillsMap(SKILL_OPTIONS),
    []
  );

  const toggleTech = (tech: string) => {
    const normalized = normalizeSkillName(tech);
    if (!normalized) return;
    setTechStack((prev) => {
      const exists = prev.some((item) => skillsEqual(item, normalized));
      return exists
        ? prev.filter((item) => !skillsEqual(item, normalized))
        : [...prev, normalized];
    });
  };

  const addCustomTech = () => {
    const normalized = normalizeSkillName(customTech);
    if (!normalized) {
      toast({
        variant: "destructive",
        title: "Enter a technology name",
      });
      return;
    }
    if (normalized.length > MAX_CUSTOM_SKILL_LENGTH) {
      toast({
        variant: "destructive",
        title: "Name too long",
        description: `Keep it under ${MAX_CUSTOM_SKILL_LENGTH} characters.`,
      });
      return;
    }

    const listedMatch = listedTech.get(normalized.toLowerCase());
    if (listedMatch) {
      if (techStack.some((item) => skillsEqual(item, listedMatch))) {
        toast({
          title: "Already selected",
          description: `"${listedMatch}" is already in your tech stack.`,
        });
      } else {
        setTechStack((prev) => [...prev, listedMatch]);
      }
      setCustomTech("");
      return;
    }

    if (techStack.some((item) => skillsEqual(item, normalized))) {
      toast({
        title: "Already selected",
        description: `"${normalized}" is already in your tech stack.`,
      });
      setCustomTech("");
      return;
    }

    setTechStack((prev) => [...prev, normalized]);
    setCustomTech("");
  };

  const mutation = useMutation({
    mutationFn: (data: ProjectForm) => {
      const cover = coverImage?.trim();
      const validCover =
        cover && isRenderableImageUrl(cover) ? cover : undefined;

      if (cover && !validCover) {
        toast({
          variant: "destructive",
          title: "Invalid cover image",
          description:
            "Use a direct image link or upload from your computer before saving.",
        });
        throw new Error("Invalid cover image");
      }

      const payload = {
        title: data.title,
        description: data.description,
        techStack: sanitizeSkillList(techStack),
        links: {
          demo: data.demo?.trim() || undefined,
          repo: data.repo?.trim() || undefined,
        },
        images: validCover ? [validCover] : [],
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
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1"
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
        <Textarea id="project-description" rows={5} {...form.register("description")} />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>
      <ProjectCoverUpload value={coverImage} onChange={setCoverImage} />
      <div className="space-y-2">
        <Label>Tech stack</Label>
        <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 p-3">
          {techOptions.map((tech) => {
            const selected = techStack.some((item) => skillsEqual(item, tech));
            return (
              <Badge
                key={tech}
                variant={selected ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTech(tech)}
              >
                {tech}
                {selected && <X className="ml-1 h-3 w-3" />}
              </Badge>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            placeholder="Add a technology not listed…"
            maxLength={MAX_CUSTOM_SKILL_LENGTH}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTech();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full"
            onClick={addCustomTech}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Pick from the list or type your own (e.g. Supabase, Vue.js, Redis).
        </p>
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
