"use client";

import Link from "next/link";
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
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  FolderKanban,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartCard, ChartTooltip } from "@/components/shared/ChartCard";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { contactRequestsApi } from "@/lib/api/contactRequests";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { formatRelativeDate } from "@/lib/utils";

const profileViewsData = [
  { week: "W1", views: 4 },
  { week: "W2", views: 8 },
  { week: "W3", views: 12 },
  { week: "W4", views: 18 },
  { week: "W5", views: 24 },
  { week: "W6", views: 31 },
];

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => studentsApi.getProfile(user!.id),
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["student-projects", user?.id],
    queryFn: () => studentsApi.getProjects(user!.id),
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["student-contact-requests", user?.id],
    queryFn: () => contactRequestsApi.getForStudent(user!.id),
    enabled: !!user,
  });

  if (profileLoading) return <DashboardSkeleton />;
  if (profileError || !profile) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const completeness = studentsApi.getProfileCompleteness(profile, projects.length);
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const acceptedRequests = requests.filter((r) => r.status === "accepted").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile.fullName || "Student"}
        </h1>
        <p className="text-muted-foreground">Your RCA Talent dashboard</p>
      </div>

      {profile.verificationStatus === "pending" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50 p-5 shadow-sm">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Profile under review</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your profile is pending admin verification. Complete your profile to improve approval chances.
            </p>
          </div>
        </div>
      )}
      {profile.verificationStatus === "rejected" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50 p-5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Profile rejected</p>
            <p className="text-sm text-red-700 mt-0.5">
              {profile.rejectionReason || "Please update your profile and resubmit."}
            </p>
            <Button size="sm" className="mt-3 rounded-full" asChild>
              <Link href="/student/profile">Update & resubmit</Link>
            </Button>
          </div>
        </div>
      )}
      {profile.verificationStatus === "approved" && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50 p-5 shadow-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-900">Profile verified</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Your profile is visible to companies on RCA Talent.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Profile completeness"
          value={`${completeness}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Profile views"
          value={profileViewsData.at(-1)?.views ?? 0}
          subtitle="This month"
          icon={<Eye className="h-5 w-5" />}
          trend={{ value: 28, label: "vs last month" }}
        />
        <StatCard
          title="Pending requests"
          value={pendingRequests}
          subtitle={`${acceptedRequests} accepted`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Projects"
          value={projects.length}
          icon={<FolderKanban className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Profile Views"
          description="Weekly profile impressions"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={profileViewsData}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A2B4B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A2B4B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EB" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#1A2B4B"
                fill="url(#viewsGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Profile Health">
          <div className="space-y-5 pt-2">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Completeness</span>
                <span className="font-semibold">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verification</span>
              <StatusBadge status={profile.verificationStatus} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skills listed</span>
              <span className="font-semibold">{profile.skills.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projects</span>
              <span className="font-semibold">{projects.length}</span>
            </div>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <Link href="/student/profile">Improve profile</Link>
            </Button>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Recent Contact Requests">
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No contact requests yet.</p>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-border/40 p-4 hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">
                    {req.company?.companyName ?? "Unknown company"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeDate(req.createdAt)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/student/contact-requests">View all requests →</Link>
            </Button>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
