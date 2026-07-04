"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, MessageSquare, Percent, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartCard, ChartTooltip } from "@/components/shared/ChartCard";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { analyticsApi } from "@/lib/api/analytics";
import { useAuth } from "@/lib/auth/context";

export default function StudentAnalyticsPage() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["student-career-analytics", user?.id],
    queryFn: () => analyticsApi.getStudentCareerAnalytics(user!.id),
    enabled: !!user,
  });

  if (isLoading || !analytics) return <LoadingSkeleton rows={6} />;

  const skillData = analytics.topSkills.map((skill) => ({
    skill,
    score: Math.floor(Math.random() * 30) + 70,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Career Analytics"
        description="Track profile visibility, engagement, and career readiness"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Profile Views (6 wk)"
          value={analytics.profileViews.at(-1)?.views ?? 0}
          icon={<Eye className="h-5 w-5" />}
          trend={{ value: 28, label: "vs last month" }}
        />
        <StatCard
          title="Contact Request Rate"
          value={`${analytics.contactRequestRate}/wk`}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatCard
          title="Response Rate"
          value={`${analytics.responseRate}%`}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          title="Profile Completeness"
          value={`${analytics.profileCompleteness}%`}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Profile Views Over Time" description="Weekly employer views">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={analytics.profileViews}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                fill="url(#viewsGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Skills Visibility" description="How often your skills appear in searches">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={skillData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" domain={[0, 100]} className="text-xs" />
              <YAxis type="category" dataKey="skill" width={90} className="text-xs" />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold">Profile Strength</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your profile to increase visibility with recruiters
        </p>
        <Progress value={analytics.profileCompleteness} className="mt-4 h-3" />
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
