"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Building2,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChartCard, ChartTooltip } from "@/components/shared/ChartCard";
import { StatCard } from "@/components/shared/StatCard";
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { adminApi } from "@/lib/api/admin";
import { designTokens } from "@/lib/design-tokens";

const CHART_COLORS = [
  designTokens.colors.chart.navy,
  designTokens.colors.chart.blue,
  designTokens.colors.chart.teal,
  designTokens.colors.chart.green,
  designTokens.colors.chart.amber,
];

export default function AdminOverviewPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => adminApi.getMetrics(),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics(),
  });

  if (metricsLoading || analyticsLoading) return <DashboardSkeleton />;
  if (!metrics || !analytics) return null;

  const verificationData = [
    { name: "Approved", value: metrics.approvedStudents, fill: "#10B981" },
    { name: "Pending", value: metrics.pendingStudents, fill: "#F59E0B" },
    { name: "Rejected", value: metrics.rejectedStudents, fill: "#EF4444" },
  ];

  const acceptanceRate =
    metrics.totalContactRequests > 0
      ? Math.round(
          (metrics.requestsByStatus.accepted / metrics.totalContactRequests) * 100
        )
      : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Overview"
        description="RCA Talent marketplace analytics & insights"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={metrics.totalStudents}
          subtitle={`${metrics.approvedStudents} verified`}
          icon={<GraduationCap className="h-5 w-5" />}
          trend={{ value: 12, label: "vs last month" }}
        />
        <StatCard
          title="Pending Verification"
          value={metrics.pendingStudents}
          subtitle="Awaiting review"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Companies"
          value={metrics.totalCompanies}
          subtitle="Registered employers"
          icon={<Building2 className="h-5 w-5" />}
          trend={{ value: 8, label: "vs last month" }}
        />
        <StatCard
          title="Contact Requests"
          value={metrics.totalContactRequests}
          subtitle={`${acceptanceRate}% acceptance rate`}
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 24, label: "vs last month" }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Platform Growth"
          description="Monthly registrations & activity"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.growth}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A2B4B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1A2B4B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B5998" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B5998" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="students"
                name="Students"
                stroke="#1A2B4B"
                fill="url(#colorStudents)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#3B5998"
                fill="url(#colorRequests)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Verification Status" description="Student profiles">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={verificationData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {verificationData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Top Skills" description="Most common student skills">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={analytics.topSkills}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="skill" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
                {analytics.topSkills.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cohort Breakdown" description="Students by graduation year">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.cohortBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EB" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="approved" name="Approved" stackId="a" fill="#10B981" />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#F59E0B" />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Request Trends"
          description="Contact request volume"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={analytics.growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="companies"
                name="Companies"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke="#1A2B4B"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recent Activity" description="Latest platform events">
          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {analytics.recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{item.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.actor}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 rounded-full">
                  {item.time}
                </Badge>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
