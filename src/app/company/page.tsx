"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CheckCircle, FileText, Search, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartCard, ChartTooltip } from "@/components/shared/ChartCard";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { companiesApi } from "@/lib/api/companies";
import { contactRequestsApi } from "@/lib/api/contactRequests";
import { useAuth } from "@/lib/auth/context";
import { formatRelativeDate } from "@/lib/utils";

export default function CompanyDashboardPage() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["company-profile", user?.id],
    queryFn: () => companiesApi.getProfile(user!.id),
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["company-contact-requests", user?.id],
    queryFn: () => contactRequestsApi.getForCompany(user!.id),
    enabled: !!user,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["company-bookmarks", user?.id],
    queryFn: () => bookmarksApi.getAll(user!.id),
    enabled: !!user,
  });

  if (isLoading) return <DashboardSkeleton />;

  const pending = requests.filter((r) => r.status === "pending").length;
  const accepted = requests.filter((r) => r.status === "accepted").length;
  const declined = requests.filter((r) => r.status === "declined").length;

  const requestChartData = [
    { status: "Pending", count: pending, fill: "#F59E0B" },
    { status: "Accepted", count: accepted, fill: "#10B981" },
    { status: "Declined", count: declined, fill: "#6B7280" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {profile?.companyName ?? "Company Dashboard"}
        </h1>
        <p className="text-muted-foreground">Discover and connect with RCA talent</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active requests"
          value={pending}
          subtitle="Awaiting response"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Accepted contacts"
          value={accepted}
          subtitle="Ready to connect"
          icon={<CheckCircle className="h-5 w-5" />}
          trend={{ value: 15, label: "vs last month" }}
        />
        <StatCard
          title="Saved talent"
          value={bookmarks.length}
          subtitle="Bookmarked profiles"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total outreach"
          value={requests.length}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Request Pipeline"
          description="Outreach status breakdown"
          className="lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={requestChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EB" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Requests" radius={[6, 6, 0, 0]}>
                {requestChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Recent Requests"
          description="Latest outreach activity"
          className="lg:col-span-2"
        >
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No requests sent yet. Start by searching for talent.
            </p>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 p-4"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {req.student?.fullName ?? "Unknown student"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(req.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="rounded-full" asChild>
          <Link href="/company/search">
            <Search className="mr-2 h-4 w-4" />
            Find talent
          </Link>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <Link href="/company/bookmarks">Saved talent ({bookmarks.length})</Link>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <Link href="/company/requests">View all requests</Link>
        </Button>
      </div>
    </div>
  );
}
