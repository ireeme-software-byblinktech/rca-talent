"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TalentProfileCard } from "@/components/shared/TalentProfileCard";
import { CardGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import type { StudentWithUser } from "@/types";

export default function CompanyBookmarksPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>("table");

  const { data: bookmarkIds = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ["company-bookmarks", user?.id],
    queryFn: () => bookmarksApi.getAll(user!.id),
    enabled: !!user,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["bookmarked-students", bookmarkIds],
    queryFn: async () => {
      const results = await Promise.all(
        bookmarkIds.map((id) => studentsApi.getStudentWithUser(id))
      );
      return results.filter(Boolean) as StudentWithUser[];
    },
    enabled: bookmarkIds.length > 0,
  });

  const isLoading = bookmarksLoading || (bookmarkIds.length > 0 && studentsLoading);

  const columns: Column<StudentWithUser>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        sortValue: (row) => row.fullName,
        exportValue: (row) => row.fullName,
        cell: (row) => (
          <div>
            <p className="font-semibold">{row.fullName}</p>
            <p className="text-xs text-muted-foreground">
              Class of {row.cohortYear}
            </p>
          </div>
        ),
      },
      {
        key: "bio",
        header: "Bio",
        exportValue: (row) => row.bio,
        cell: (row) => (
          <p className="max-w-xs text-sm text-muted-foreground line-clamp-2">
            {row.bio || "—"}
          </p>
        ),
      },
      {
        key: "skills",
        header: "Skills",
        exportValue: (row) => row.skills.join(", "),
        cell: (row) => (
          <div className="flex max-w-[220px] flex-wrap gap-1">
            {row.skills.slice(0, 4).map((s) => (
              <span key={s} className="skill-pill text-[10px]">
                {s}
              </span>
            ))}
            {row.skills.length > 4 && (
              <span className="skill-pill skill-pill-muted text-[10px]">
                +{row.skills.length - 4}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "availability",
        header: "Availability",
        exportValue: (row) => row.availability.join(", "),
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.availability.map((a) => (
              <Badge key={a} variant="outline" className="text-[10px] capitalize">
                {a}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) => (
          <Button variant="outline" size="sm" className="h-8 rounded-full" asChild>
            <Link href={`/company/students/${row.userId}`}>View profile</Link>
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Talent"
        description="Students you've bookmarked for future outreach"
      >
        <ViewToggle value={view} onChange={setView} />
      </PageHeader>

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8" />}
          title="No saved talent yet"
          description="Bookmark student profiles while browsing to save them here for later."
        />
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <TalentProfileCard
              key={student.userId}
              student={student}
              href={`/company/students/${student.userId}`}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={students.map((s) => ({ ...s, id: s.userId }))}
          searchable
          exportable
          searchPlaceholder="Filter saved talent..."
        />
      )}
    </div>
  );
}
