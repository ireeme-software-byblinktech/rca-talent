"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MessageSquare, Percent, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartCard, ChartTooltip } from "@/components/shared/ChartCard";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { analyticsApi } from "@/lib/api/analytics";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { queryKeys } from "@/lib/query/keys";

export default function StudentAnalyticsPage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: queryKeys.students.profile(user?.id ?? ""),
    queryFn: () => studentsApi.getProfile(user!.id),
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.students.projects(user?.id ?? ""),
    queryFn: () => studentsApi.getProjects(user!.id),
    enabled: !!user,
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: queryKeys.students.analytics(user?.id ?? ""),
    queryFn: () => analyticsApi.getStudentCareerAnalytics(user!.id),
    enabled: !!user,
  });

  if (isLoading || !analytics) return <LoadingSkeleton rows={6} />;

  const completeness =
    profile != null
      ? studentsApi.getProfileCompleteness(profile, projects.length)
      : analytics.profileCompleteness;

  const weeklyContactRequests = analytics.weeklyContactRequests ?? [];
  const latestWeek = weeklyContactRequests.at(-1)?.count ?? 0;
  const previousWeek = weeklyContactRequests.at(-2)?.count ?? 0;
  const weekTrend =
    previousWeek > 0
      ? Math.round(((latestWeek - previousWeek) / previousWeek) * 100)
      : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Career Analytics"
        description="Engagement and profile readiness from your live account data"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total contact requests"
          value={analytics.totalContactRequests}
          subtitle={`${latestWeek} this week`}
          icon={<MessageSquare className="h-5 w-5" />}
          trend={
            weekTrend !== undefined
              ? { value: weekTrend, label: "vs prior week" }
              : undefined
          }
        />
        <StatCard
          title="Contact request rate"
          value={`${analytics.contactRequestRate}/wk`}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Response rate"
          value={`${analytics.responseRate}%`}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          title="Profile completeness"
          value={`${completeness}%`}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Contact Request Activity"
          description="Weekly requests received from employers"
        >
          {weeklyContactRequests.every((week) => week.count === 0) ? (
            <div className="flex h-[260px] w-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No contact requests yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyContactRequests}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Requests"
                  stroke="hsl(var(--primary))"
                  fill="url(#viewsGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Your skills" description="Skills saved on your profile">
          {analytics.topSkills.length === 0 ? (
            <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
              Add skills to your profile to see them here.
            </p>
          ) : (
            <div className="flex min-h-[260px] flex-wrap content-start gap-2 p-2">
              {analytics.topSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="skill-pill">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold">Profile strength</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on your saved profile, projects, and skills
        </p>
        <Progress value={completeness} className="mt-4 h-3" />
        <div className="mt-4 flex flex-wrap gap-2">
          {analytics.topSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="skill-pill">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
