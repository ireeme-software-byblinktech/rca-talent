"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  Loader2,
  Mail,
  Send,
  Trash2,
  UserMinus,
  Users,
} from "lucide-react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { blogApi } from "@/lib/api/blog";
import { stripHtml } from "@/lib/blog/utils";
import type { BlogSubscriber } from "@/types";

function SubscriberRow({
  subscriber,
  onDeactivate,
  onRemove,
  isBusy,
}: {
  subscriber: BlogSubscriber;
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
          {subscriber.active && (
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onDeactivate(subscriber.id)}
            >
              <UserMinus className="mr-1 h-3.5 w-3.5" />
              Deactivate
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

export function AdminNewsletterPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery({
    queryKey: ["blog-subscribers"],
    queryFn: () => blogApi.listSubscribers(),
  });

  const { data: newsletters = [], isLoading: newslettersLoading } = useQuery({
    queryKey: ["blog-newsletters"],
    queryFn: () => blogApi.listNewsletters(),
  });

  const activeCount = subscribers.filter((s) => s.active).length;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["blog-subscribers"] });
    queryClient.invalidateQueries({ queryKey: ["blog-subscriber-count"] });
    queryClient.invalidateQueries({ queryKey: ["blog-newsletters"] });
  };

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => blogApi.deactivateSubscriber(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Subscriber deactivated" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => blogApi.removeSubscriber(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Subscriber removed" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => blogApi.sendNewsletter({ subject, bodyHtml }),
    onSuccess: (result) => {
      invalidateAll();
      setSubject("");
      setBodyHtml("");
      toast({
        title: "Newsletter sent",
        description: `Delivered to ${result.sent} of ${result.total} subscribers${result.failed ? ` (${result.failed} failed)` : ""}.`,
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not send newsletter",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  const isBusy =
    deactivateMutation.isPending ||
    removeMutation.isPending ||
    sendMutation.isPending;

  const canSend =
    subject.trim().length >= 3 && stripHtml(bodyHtml).trim().length >= 10;

  if (subscribersLoading || newslettersLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Send newsletter</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Compose and send an email to {activeCount} active subscriber
            {activeCount === 1 ? "" : "s"}.
          </p>
          <div>
            <Label htmlFor="newsletter-subject">Subject</Label>
            <Input
              id="newsletter-subject"
              className="mt-1.5"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's new at RCA Talent"
            />
          </div>
          <div>
            <Label>Body</Label>
            <BlogEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              className="mt-1.5"
            />
          </div>
          <Button
            className="w-full gap-1.5 rounded-full"
            disabled={!canSend || activeCount === 0 || sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send to {activeCount} subscriber{activeCount === 1 ? "" : "s"}
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Recent sends</h3>
          </div>
          {newsletters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No newsletters sent yet.</p>
          ) : (
            <ul className="space-y-3">
              {newsletters.map((nl) => (
                <li
                  key={nl.id}
                  className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3"
                >
                  <p className="font-medium text-sm">{nl.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(nl.createdAt), "dd MMM yyyy, HH:mm")}
                    {" · "}
                    {nl.recipientCount} sent
                    {nl.failedCount > 0 && ` · ${nl.failedCount} failed`}
                    {nl.sentBy && ` · by ${nl.sentBy}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Subscribers</h3>
          </div>
          <Badge variant="secondary">
            {activeCount} active / {subscribers.length} total
          </Badge>
        </div>

        {subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subscribers yet. They will appear here when users subscribe from the blog.
          </p>
        ) : (
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
                    onDeactivate={(id) => deactivateMutation.mutate(id)}
                    onRemove={(id) => removeMutation.mutate(id)}
                    isBusy={isBusy}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
