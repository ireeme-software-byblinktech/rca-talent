"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { SKILL_OPTIONS } from "@/lib/mock/data";
import type { Project } from "@/types";

const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  demo: z.string().url().optional().or(z.literal("")),
  repo: z.string().url().optional().or(z.literal("")),
  coverImage: z.string().url().optional().or(z.literal("")),
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

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          description: project.description,
          demo: project.links.demo ?? "",
          repo: project.links.repo ?? "",
          coverImage: project.images?.[0] ?? "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: ProjectForm) => {
      const payload = {
        title: data.title,
        description: data.description,
        techStack,
        links: { demo: data.demo || undefined, repo: data.repo || undefined },
        images: data.coverImage ? [data.coverImage] : project?.images,
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

  return (
    <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input {...form.register("title")} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={3} {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label>Cover image URL (optional)</Label>
        <Input placeholder="https://..." {...form.register("coverImage")} />
      </div>
      <div className="space-y-2">
        <Label>Tech stack</Label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {SKILL_OPTIONS.map((skill) => (
            <Badge
              key={skill}
              variant={techStack.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setTechStack((prev) =>
                  prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
                )
              }
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Demo URL</Label>
        <Input placeholder="https://..." {...form.register("demo")} />
      </div>
      <div className="space-y-2">
        <Label>Repository URL</Label>
        <Input placeholder="https://github.com/..." {...form.register("repo")} />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {project ? "Update project" : "Create project"}
      </Button>
    </form>
  );
}
