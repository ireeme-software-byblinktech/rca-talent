"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { JobPostingCard } from "@/components/shared/JobPostingCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { jobsApi } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { SKILL_OPTIONS } from "@/lib/mock/data";
import { cn, formatDate } from "@/lib/utils";
import type { JobPosting, JobType } from "@/types";

const jobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  type: z.enum(["internship", "full-time", "freelance"]),
  location: z.string().min(2),
});

type JobForm = z.infer<typeof jobSchema>;

function JobFormFields({
  form,
  skills,
  setSkills,
}: {
  form: ReturnType<typeof useForm<JobForm>>;
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <>
      <div>
        <Label>Title</Label>
        <Input
          className="mt-1.5"
          {...form.register("title")}
          placeholder="Junior Full-Stack Developer"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea className="mt-1.5" rows={4} {...form.register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(v) => form.setValue("type", v as JobType)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Input className="mt-1.5" {...form.register("location")} />
        </div>
      </div>
      <div>
        <Label>Required skills</Label>
        <div className="mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
          {SKILL_OPTIONS.slice(0, 16).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() =>
                setSkills((prev) =>
                  prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
                )
              }
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                skills.includes(skill)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40"
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function CompanyJobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [view, setView] = useState<ViewMode>("table");

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: { type: "internship", location: "Kigali, Rwanda" },
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["company-jobs", user?.id],
    queryFn: () => jobsApi.getForCompany(user!.id),
    enabled: !!user,
  });

  const stats = useMemo(
    () => ({
      open: jobs.filter((j) => j.status === "open").length,
      closed: jobs.filter((j) => j.status === "closed").length,
      total: jobs.length,
    }),
    [jobs]
  );

  useEffect(() => {
    if (editingJob) {
      form.reset({
        title: editingJob.title,
        description: editingJob.description,
        type: editingJob.type,
        location: editingJob.location,
      });
      setSkills([...editingJob.skills]);
    } else {
      form.reset({ type: "internship", location: "Kigali, Rwanda", title: "", description: "" });
      setSkills([]);
    }
  }, [editingJob, form]);

  const saveMutation = useMutation({
    mutationFn: (data: JobForm) =>
      editingJob
        ? jobsApi.update(user!.id, editingJob.id, { ...data, skills })
        : jobsApi.create(user!.id, { ...data, skills }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
      toast({ title: editingJob ? "Job updated" : "Job posted" });
      setDialogOpen(false);
      setEditingJob(null);
    },
    onError: (err) => {
      toast({
        title: "Could not save job",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "open" | "closed" }) =>
      jobsApi.updateStatus(user!.id, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
      toast({ title: "Status updated" });
    },
    onError: (err) => {
      toast({
        title: "Could not update status",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsApi.delete(user!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
      toast({ title: "Job deleted" });
    },
    onError: (err) => {
      toast({
        title: "Could not delete job",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const openCreate = () => {
    setEditingJob(null);
    setDialogOpen(true);
  };

  const openEdit = (job: JobPosting) => {
    setEditingJob(job);
    setDialogOpen(true);
  };

  const columns: Column<JobPosting>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        sortable: true,
        sortValue: (row) => row.title,
        exportValue: (row) => row.title,
        cell: (row) => (
          <div>
            <p className="font-semibold">{row.title}</p>
            <p className="max-w-xs text-xs text-muted-foreground line-clamp-1">
              {row.description}
            </p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        sortable: true,
        sortValue: (row) => row.type,
        exportValue: (row) => row.type,
        cell: (row) => (
          <span className="text-sm capitalize">{row.type.replace("-", " ")}</span>
        ),
      },
      {
        key: "location",
        header: "Location",
        exportValue: (row) => row.location,
        cell: (row) => <span className="text-sm">{row.location}</span>,
      },
      {
        key: "skills",
        header: "Skills",
        exportValue: (row) => row.skills.join(", "),
        cell: (row) => (
          <div className="flex max-w-[200px] flex-wrap gap-1">
            {row.skills.slice(0, 3).map((s) => (
              <span key={s} className="skill-pill text-[10px]">
                {s}
              </span>
            ))}
            {row.skills.length > 3 && (
              <span className="skill-pill skill-pill-muted text-[10px]">
                +{row.skills.length - 3}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        sortValue: (row) => row.status,
        exportValue: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "applicants",
        header: "Applicants",
        sortable: true,
        sortValue: (row) => row.applicationCount ?? 0,
        exportValue: (row) => String(row.applicationCount ?? 0),
        cell: (row) => (
          <Button variant="outline" size="sm" className="h-8 rounded-full" asChild>
            <Link href="/company/applicants">
              {row.applicationCount ?? 0} applicant
              {(row.applicationCount ?? 0) === 1 ? "" : "s"}
            </Link>
          </Button>
        ),
      },
      {
        key: "createdAt",
        header: "Posted",
        sortable: true,
        sortValue: (row) => row.createdAt,
        exportValue: (row) => formatDate(row.createdAt),
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) => (
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => openEdit(row)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              disabled={toggleStatus.isPending}
              onClick={() =>
                toggleStatus.mutate({
                  id: row.id,
                  status: row.status === "open" ? "closed" : "open",
                })
              }
            >
              {row.status === "open" ? "Close" : "Reopen"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-destructive hover:text-destructive"
              onClick={() => deleteMutation.mutate(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation, toggleStatus]
  );

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job & Internship Postings"
        description="Create and manage openings for RCA talent"
      >
        <ViewToggle value={view} onChange={setView} />
        <Button variant="outline" className="rounded-full" asChild>
          <Link href="/company/applicants">View applicants</Link>
        </Button>
        <Button className="gap-2 rounded-full" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Post a job
        </Button>
      </PageHeader>

      {jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Open roles", count: stats.open, icon: "●", color: "text-emerald-600" },
            { label: "Closed", count: stats.closed, icon: "●", color: "text-muted-foreground" },
            { label: "All postings", count: stats.total, icon: "●", color: "text-primary" },
          ].map((s) => (
            <div
              key={s.label}
              className="fancy-card rounded-2xl border border-border/50 p-4 !translate-y-0 !shadow-card"
            >
              <p className={cn("text-sm font-medium", s.color)}>
                <span className="mr-1.5">{s.icon}</span>
                {s.label}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {s.count}
              </p>
            </div>
          ))}
        </div>
      )}

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-10 w-10" />}
          title="No job postings yet"
          description="Post your first internship or job opening to attract RCA students."
          action={{ label: "Post a job", onClick: openCreate }}
        />
      ) : view === "cards" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobPostingCard
              key={job.id}
              job={job}
              onEdit={() => openEdit(job)}
              onToggleStatus={() =>
                toggleStatus.mutate({
                  id: job.id,
                  status: job.status === "open" ? "closed" : "open",
                })
              }
              onDelete={() => deleteMutation.mutate(job.id)}
              isToggling={toggleStatus.isPending}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={jobs}
          searchable
          exportable
          searchPlaceholder="Filter jobs..."
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingJob(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit job posting" : "New job posting"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))}
            className="space-y-4"
          >
            <JobFormFields form={form} skills={skills} setSkills={setSkills} />
            <Button type="submit" className="w-full rounded-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingJob ? "Save changes" : "Publish posting"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
