"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Send,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { blogApi } from "@/lib/api/blog";
import { stripHtml } from "@/lib/blog/utils";
import type { BlogNewsletter } from "@/types";

const NEWSLETTER_PAGE_SIZE = 10;

function NewsletterRow({
  newsletter,
  onActivate,
  onDeactivate,
  onRemove,
  isBusy,
}: {
  newsletter: BlogNewsletter;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onRemove: (id: string) => void;
  isBusy: boolean;
}) {
  return (
    <li className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-sm">{newsletter.subject}</p>
            <Badge variant={(newsletter.active ?? true) ? "default" : "secondary"}>
              {(newsletter.active ?? true) ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {format(new Date(newsletter.createdAt), "dd MMM yyyy, HH:mm")}
            {" · "}
            {newsletter.recipientCount} sent
            {newsletter.failedCount > 0 && ` · ${newsletter.failedCount} failed`}
            {newsletter.sentBy && ` · by ${newsletter.sentBy}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {(newsletter.active ?? true) ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onDeactivate(newsletter.id)}
            >
              <UserMinus className="mr-1 h-3.5 w-3.5" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onActivate(newsletter.id)}
            >
              <UserCheck className="mr-1 h-3.5 w-3.5" />
              Activate
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            disabled={isBusy}
            onClick={() => onRemove(newsletter.id)}
            aria-label="Delete newsletter"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function AdminNewsletterPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [newsletterPage, setNewsletterPage] = useState(1);

  const { data: subscriberCount = 0 } = useQuery({
    queryKey: ["blog-subscriber-count"],
    queryFn: () => blogApi.getSubscriberCount(),
  });

  const { data: newslettersData, isLoading: newslettersLoading } = useQuery({
    queryKey: ["blog-newsletters", newsletterPage],
    queryFn: () =>
      blogApi.listNewsletters({
        page: newsletterPage,
        pageSize: NEWSLETTER_PAGE_SIZE,
      }),
  });

  const newsletters = newslettersData?.items ?? [];
  const newsletterTotalPages = newslettersData?.totalPages ?? 1;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["blog-subscribers"] });
    queryClient.invalidateQueries({ queryKey: ["blog-subscriber-count"] });
    queryClient.invalidateQueries({ queryKey: ["blog-newsletters"] });
  };

  const sendMutation = useMutation({
    mutationFn: () => blogApi.sendNewsletter({ subject, bodyHtml }),
    onSuccess: (result) => {
      invalidateAll();
      setSubject("");
      setBodyHtml("");
      setNewsletterPage(1);
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

  const deactivateNewsletterMutation = useMutation({
    mutationFn: (id: string) => blogApi.deactivateNewsletter(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Newsletter deactivated" });
    },
  });

  const activateNewsletterMutation = useMutation({
    mutationFn: (id: string) => blogApi.activateNewsletter(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Newsletter activated" });
    },
  });

  const deleteNewsletterMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteNewsletter(id),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Newsletter deleted" });
    },
  });

  const isBusy =
    sendMutation.isPending ||
    deactivateNewsletterMutation.isPending ||
    activateNewsletterMutation.isPending ||
    deleteNewsletterMutation.isPending;

  const canSend =
    subject.trim().length >= 3 && stripHtml(bodyHtml).trim().length >= 10;

  if (newslettersLoading) {
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
            Compose and send an email to {subscriberCount} active subscriber
            {subscriberCount === 1 ? "" : "s"}.
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
            disabled={!canSend || subscriberCount === 0 || sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send to {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Sent newsletters</h3>
          </div>
          {newsletters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No newsletters sent yet.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {newsletters.map((nl) => (
                  <NewsletterRow
                    key={nl.id}
                    newsletter={nl}
                    onActivate={(id) => activateNewsletterMutation.mutate(id)}
                    onDeactivate={(id) => deactivateNewsletterMutation.mutate(id)}
                    onRemove={(id) => deleteNewsletterMutation.mutate(id)}
                    isBusy={isBusy}
                  />
                ))}
              </ul>
              {newsletterTotalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {newsletterPage} of {newsletterTotalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={newsletterPage <= 1}
                      onClick={() =>
                        setNewsletterPage((p) => Math.max(1, p - 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={newsletterPage >= newsletterTotalPages}
                      onClick={() =>
                        setNewsletterPage((p) =>
                          Math.min(newsletterTotalPages, p + 1)
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
