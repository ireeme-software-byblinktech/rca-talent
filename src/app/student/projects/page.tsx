"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ExternalLink,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { ProjectFormDialog } from "@/components/shared/ProjectFormDialog";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";

export default function StudentProjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [view, setView] = useState<ViewMode>("cards");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["student-projects", user?.id],
    queryFn: () => studentsApi.getProjects(user!.id),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) =>
      studentsApi.deleteProject(user!.id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
      toast({ title: "Project deleted" });
    },
  });

  const columns: Column<Project>[] = [
    {
      key: "title",
      header: "Project",
      sortable: true,
      sortValue: (row) => row.title,
      exportValue: (row) => row.title,
      cell: (row) => (
        <div>
          <p className="font-semibold">{row.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      key: "stack",
      header: "Tech stack",
      exportValue: (row) => row.techStack.join(", "),
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.techStack.slice(0, 3).map((t) => (
            <span key={t} className="skill-pill text-[10px]">{t}</span>
          ))}
          {row.techStack.length > 3 && (
            <span className="skill-pill skill-pill-muted text-[10px]">
              +{row.techStack.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "links",
      header: "Links",
      cell: (row) => (
        <div className="flex gap-2">
          {row.links.demo && (
            <a href={row.links.demo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs inline-flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Demo
            </a>
          )}
          {row.links.repo && (
            <a href={row.links.repo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs inline-flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Repo
            </a>
          )}
        </div>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      sortable: true,
      sortValue: (row) => row.updatedAt,
      exportValue: (row) => formatDate(row.updatedAt),
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingProject(row);
              setDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => deleteMutation.mutate(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSkeleton rows={3} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Showcase your portfolio work"
      >
        <ViewToggle value={view} onChange={setView} />
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingProject(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add project
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit project" : "New project"}
              </DialogTitle>
            </DialogHeader>
            <ProjectFormDialog
              project={editingProject}
              onClose={() => {
                setDialogOpen(false);
                setEditingProject(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title="No projects yet"
          description="Add your first project to showcase your skills to employers."
          action={{
            label: "Add project",
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : view === "cards" ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => {
                setEditingProject(project);
                setDialogOpen(true);
              }}
              onDelete={() => deleteMutation.mutate(project.id)}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          searchable
          exportable
          searchPlaceholder="Search projects..."
        />
      )}
    </div>
  );
}
