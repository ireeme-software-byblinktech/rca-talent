"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2, UserCheck, UserMinus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { blogApi } from "@/lib/api/blog";
import type { BlogSubscriber } from "@/types";

const PAGE_SIZE = 20;

function SubscriberRow({
  subscriber,
  onActivate,
  onDeactivate,
  onRemove,
  isBusy,
}: {
  subscriber: BlogSubscriber;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onRemove: (id: string) => void;
  isBusy: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{subscriber.email}</TableCell>
      <TableCell>
        <Badge variant={subscriber.active ? "default" : "secondary"}>
          {subscriber.active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(subscriber.subscribedAt), "dd MMM yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {subscriber.active ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onDeactivate(subscriber.id)}
            >
              <UserMinus className="mr-1 h-3.5 w-3.5" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onActivate(subscriber.id)}
            >
              <UserCheck className="mr-1 h-3.5 w-3.5" />
              Activate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => onRemove(subscriber.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AdminSubscribersPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const activeFilter =
    statusFilter === "all" ? undefined : statusFilter === "active";

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["blog-subscribers", page, statusFilter],
    queryFn: () =>
      blogApi.listSubscribers({
        page,
        pageSize: PAGE_SIZE,
        active: activeFilter,
      }),
  });

  const subscribers = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["blog-subscribers"] });
    queryClient.invalidateQueries({ queryKey: ["blog-subscriber-count"] });
  };

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => blogApi.deactivateSubscriber(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Subscriber deactivated" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => blogApi.activateSubscriber(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Subscriber activated" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => blogApi.removeSubscriber(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Subscriber removed" });
    },
  });

  const isBusy =
    deactivateMutation.isPending ||
    activateMutation.isPending ||
    removeMutation.isPending;

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Subscribers</h3>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as "all" | "active" | "inactive");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary">{total} total</Badge>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No subscribers"
          description="Subscribers will appear here when users sign up from the blog."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => (
                  <SubscriberRow
                    key={sub.id}
                    subscriber={sub}
                    onActivate={(id) => activateMutation.mutate(id)}
                    onDeactivate={(id) => deactivateMutation.mutate(id)}
                    onRemove={(id) => removeMutation.mutate(id)}
                    isBusy={isBusy}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
              {isFetching && (
                <span className="ml-2 text-xs text-primary">Updating…</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
