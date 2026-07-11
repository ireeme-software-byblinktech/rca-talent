"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
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
import { AdminMetricStrip } from "@/components/admin/AdminMetricStrip";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { adminApi } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [searchParams, setSearchParams] = useState({ query: "", role: "all" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", searchParams],
    queryFn: () =>
      adminApi.getAllUsers({
        query: searchParams.query || undefined,
        role: searchParams.role !== "all" ? searchParams.role : undefined,
        pageSize: 50,
      }),
  });

  const users = useMemo(() => data?.data ?? [], [data?.data]);

  const toggleMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminApi.toggleUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User status updated" });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not update user status",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  const metrics = useMemo(
    () => [
      { label: "Total users", value: users.length, color: "text-primary" },
      {
        label: "Students",
        value: users.filter((u) => u.role === "student").length,
        color: "text-emerald-600",
      },
      {
        label: "Companies",
        value: users.filter((u) => u.role === "company").length,
        color: "text-sky-600",
      },
      {
        label: "Suspended",
        value: users.filter((u) => !u.isActive).length,
        color: "text-rose-600",
      },
    ],
    [users]
  );

  const columns: Column<User>[] = [
    {
      key: "email",
      header: "Email",
      sortable: true,
      sortValue: (row) => row.email,
      exportValue: (row) => row.email,
      cell: (row) => <span className="font-medium">{row.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      sortValue: (row) => row.role,
      exportValue: (row) => row.role,
      cell: (row) => (
        <Badge variant="outline" className="capitalize font-medium rounded-full">
          {row.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => (row.isActive ? 1 : 0),
      exportValue: (row) => (row.isActive ? "Active" : "Suspended"),
      cell: (row) => (
        <Badge variant={row.isActive ? "approved" : "rejected"} className="rounded-full">
          {row.isActive ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      key: "created",
      header: "Joined",
      sortable: true,
      sortValue: (row) => row.createdAt,
      exportValue: (row) => formatDate(row.createdAt),
      cell: (row) => (
        <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full"
          onClick={() =>
            toggleMutation.mutate({
              userId: row.id,
              isActive: !row.isActive,
            })
          }
          disabled={toggleMutation.isPending}
        >
          {row.isActive ? "Suspend" : "Reactivate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage students and companies on the platform"
      />

      {!isLoading && users.length > 0 && <AdminMetricStrip metrics={metrics} />}

      <div className="fancy-card rounded-2xl border border-border/50 p-4 !translate-y-0 !shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              className="pl-9 rounded-xl border-0 bg-secondary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearchParams({ query, role })}
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full sm:w-36 rounded-xl">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
          <Button className="rounded-full" onClick={() => setSearchParams({ query, role })}>
            Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : users.length === 0 ? (
        <div className="fancy-card rounded-2xl border border-border/50 p-12 text-center !translate-y-0 !shadow-card">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium">No users found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchable
          exportable
          selectable
          searchPlaceholder="Filter users..."
          emptyMessage="No users found"
        />
      )}
    </div>
  );
}
