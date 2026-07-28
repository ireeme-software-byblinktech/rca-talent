"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Code2, ExternalLink, FolderKanban, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectShowcaseCard } from "@/components/shared/ProjectShowcaseCard";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { studentsApi } from "@/lib/api/students";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";

type ApprovedProject = Project & {
  student?: {
    id: string;
    fullName: string;
    userId: string;
    email: string;
    cohortYear?: number | null;
  };
};

export default function CompanyVerifiedProjectsPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("cards");

  const { data: projects = [], isLoading, isError, error } = useQuery({
    queryKey: ["approved-projects"],
    queryFn: () => studentsApi.getApprovedProjects(),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects as ApprovedProject[];
    return (projects as ApprovedProject[]).filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q)) ||
        p.student?.fullName.toLowerCase().includes(q) ||
        p.student?.email.toLowerCase().includes(q)
    );
  }, [projects, query]);

  const columns: Column<ApprovedProject>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Project",
        sortable: true,
        sortValue: (row) => row.title,
        exportValue: (row) => row.title,
        cell: (row) => (
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate max-w-[200px]">
              {row.title}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {row.description}
            </p>
          </div>
        ),
      },
      {
        key: "owner",
        header: "Owner",
        sortable: true,
        sortValue: (row) => row.student?.fullName ?? "",
        exportValue: (row) => row.student?.fullName ?? "",
        cell: (row) =>
          row.student ? (
            <div>
              <p className="font-medium text-sm">{row.student.fullName}</p>
              <p className="text-xs text-muted-foreground">{row.student.email}</p>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: "tech",
        header: "Tech",
        exportValue: (row) => row.techStack.join(", "),
        cell: (row) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {row.techStack.slice(0, 4).map((t) => (
              <span key={t} className="skill-pill text-[10px]">
                {t}
              </span>
            ))}
            {row.techStack.length > 4 && (
              <span className="skill-pill skill-pill-muted text-[10px]">
                +{row.techStack.length - 4}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) =>
          row.student ? (
            <Button variant="outline" size="sm" className="rounded-full h-8" asChild>
              <Link href={`/company/students/${row.student.userId}?from=verified-projects`}>
                View owner
              </Link>
            </Button>
          ) : null,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verified Projects"
        description="Projects approved by RCA Talent admins, with student owners"
      >
        <ViewToggle value={view} onChange={setView} />
      </PageHeader>

      <div className="fancy-card p-4 !translate-y-0 !shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by project, owner, or tech..."
            className="pl-9 bg-secondary border-0 h-11 rounded-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title="Could not load verified projects"
          description={
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again."
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title="No verified projects yet"
          description="Approved student projects will appear here once an admin publishes them."
        />
      ) : (
        <>
          <p className="text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-bold">{filtered.length}</span>{" "}
            approved project{filtered.length !== 1 ? "s" : ""}
          </p>

          {view === "cards" ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((project) => (
                <ProjectShowcaseCard
                  key={project.id}
                  project={project}
                  owner={project.student}
                  variant="verified"
                />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered.map((p) => ({ ...p, id: p.id }))}
              searchable
              exportable
              searchPlaceholder="Search by project or owner..."
            />
          )}
        </>
      )}
    </div>
  );
}
