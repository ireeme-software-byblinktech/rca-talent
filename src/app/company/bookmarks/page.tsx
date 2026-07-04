"use client";

import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { TalentProfileCard } from "@/components/shared/TalentProfileCard";
import { CardGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";

export default function CompanyBookmarksPage() {
  const { user } = useAuth();

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
      return results.filter(Boolean);
    },
    enabled: bookmarkIds.length > 0,
  });

  const isLoading = bookmarksLoading || (bookmarkIds.length > 0 && studentsLoading);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Talent</h1>
        <p className="text-muted-foreground">
          Students you&apos;ve bookmarked for future outreach
        </p>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8" />}
          title="No saved talent yet"
          description="Bookmark student profiles while browsing to save them here for later."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map(
            (student) =>
              student && (
                <TalentProfileCard
                  key={student.userId}
                  student={student}
                  href={`/company/students/${student.userId}`}
                />
              )
          )}
        </div>
      )}
    </div>
  );
}
