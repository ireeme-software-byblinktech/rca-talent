"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, Code2, ExternalLink, Link2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProjectsCarousel } from "@/components/shared/ProjectsCarousel";
import { studentsApi } from "@/lib/api/students";

export default function AdminStudentProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const fromProjectReviews = searchParams.get("from") === "project-reviews";

  const { data: student, isLoading, error } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => studentsApi.getStudentWithUser(studentId),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["student-projects", studentId],
    queryFn: () => studentsApi.getProjects(studentId),
    enabled: !!studentId,
  });

  const displayProjects = useMemo(() => {
    if (!fromProjectReviews) return projects;
    const approvedOrPending = projects.filter(
      (p) =>
        p.publishStatus === "approved" || p.publishStatus === "pending_review"
    );
    return approvedOrPending.length > 0 ? approvedOrPending : projects;
  }, [projects, fromProjectReviews]);

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (error || !student) return <ErrorState title="Student not found" />;

  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {fromProjectReviews && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 -ml-2 text-muted-foreground"
          asChild
        >
          <Link href="/admin/project-reviews">
            <ArrowLeft className="h-4 w-4" />
            Back to Project Reviews
          </Link>
        </Button>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-brand/10 text-brand text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{student.fullName}</h1>
              <p className="text-muted-foreground">
                RCA Class of {student.cohortYear}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {student.user?.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {student.availability.map((a) => (
                  <Badge key={a} variant="outline" className="capitalize text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {student.bio && (
            <p className="mt-4 text-muted-foreground">{student.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {student.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex gap-4">
            {student.links.github && (
              <a
                href={student.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand hover:underline"
              >
                <Code2 className="h-4 w-4" /> GitHub
              </a>
            )}
            {student.links.linkedin && (
              <a
                href={student.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand hover:underline"
              >
                <Link2 className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {student.links.portfolio && (
              <a
                href={student.links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Portfolio
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <ProjectsCarousel projects={displayProjects} />
      </div>
    </div>
  );
}
