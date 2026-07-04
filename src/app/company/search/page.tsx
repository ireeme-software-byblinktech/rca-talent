"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardGridSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TalentProfileCard } from "@/components/shared/TalentProfileCard";
import { ViewToggle, type ViewMode } from "@/components/shared/ViewToggle";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { studentsApi } from "@/lib/api/students";
import { COHORT_YEARS, SKILL_OPTIONS } from "@/lib/mock/data";
import type { Availability, StudentWithUser } from "@/types";

export default function CompanySearchPage() {
  const [query, setQuery] = useState("");
  const [cohortYear, setCohortYear] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("cards");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "talent-search",
      searchTerm,
      cohortYear,
      availability,
      selectedSkills,
    ],
    queryFn: () =>
      studentsApi.search({
        query: searchTerm || undefined,
        cohortYear: cohortYear && cohortYear !== "all" ? Number(cohortYear) : undefined,
        availability:
          availability && availability !== "all"
            ? (availability as Availability)
            : undefined,
        skills: selectedSkills.length ? selectedSkills : undefined,
        pageSize: 24,
      }),
  });

  const students = data?.data ?? [];

  const handleSearch = () => {
    setSearchTerm(query);
    refetch();
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

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
          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
            {row.bio || "—"}
          </p>
        ),
      },
      {
        key: "skills",
        header: "Skills",
        exportValue: (row) => row.skills.join(", "),
        cell: (row) => (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {row.skills.slice(0, 4).map((s) => (
              <span key={s} className="skill-pill text-[10px]">{s}</span>
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
          <Button variant="outline" size="sm" className="rounded-full h-8" asChild>
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
        title="Find Talent"
        description="Search verified RCA graduate profiles"
      >
        <ViewToggle value={view} onChange={setView} />
      </PageHeader>

      <div className="fancy-card p-4 !translate-y-0 !shadow-card space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, or keywords..."
              className="pl-9 bg-secondary border-0 h-11 rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="rounded-xl h-11 px-6">
            Search
          </Button>
          <Button
            variant="outline"
            className="rounded-xl h-11"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-border/40 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cohort year</label>
                <Select value={cohortYear} onValueChange={setCohortYear}>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any year</SelectItem>
                    {COHORT_YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue placeholder="Any availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.slice(0, 12).map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer rounded-full"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setCohortYear("all");
                setAvailability("all");
                setSelectedSkills([]);
                setSearchTerm("");
                setQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No students found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold">{data?.total}</span>{" "}
              student{data?.total !== 1 ? "s" : ""} found
            </p>
          </div>

          {view === "cards" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
              searchPlaceholder="Filter results..."
            />
          )}
        </>
      )}
    </div>
  );
}
