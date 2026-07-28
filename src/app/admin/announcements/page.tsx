"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { announcementsApi } from "@/lib/api/announcements";
import type { AnnouncementAudience, SiteAnnouncement } from "@/types";

const audienceLabels: Record<AnnouncementAudience, string> = {
  all: "Everyone",
  student: "Students",
  company: "Employers",
};

function AnnouncementRow({
  item,
  onToggle,
  onEdit,
  onRemove,
  isBusy,
}: {
  item: SiteAnnouncement;
  onToggle: (id: string, published: boolean) => void;
  onEdit: (item: SiteAnnouncement) => void;
  onRemove: (id: string) => void;
  isBusy: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="max-w-md">
        <p className="font-medium leading-snug">{item.message}</p>
        {item.linkUrl && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{item.linkUrl}</p>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="rounded-full capitalize">
          {audienceLabels[item.audience]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={item.published}
            onCheckedChange={(checked) => onToggle(item.id, checked)}
            disabled={isBusy}
          />
          <span className="text-xs text-muted-foreground">
            {item.published ? "Live" : "Draft"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {format(new Date(item.updatedAt), "dd MMM yyyy, HH:mm")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={isBusy}
            onClick={() => onEdit(item)}
            aria-label="Edit announcement"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isBusy}
            onClick={() => onRemove(item.id)}
            aria-label="Remove announcement"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [publishNow, setPublishNow] = useState(true);
  const [editing, setEditing] = useState<SiteAnnouncement | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editAudience, setEditAudience] = useState<AnnouncementAudience>("all");
  const [editPublished, setEditPublished] = useState(true);

  const openEditDialog = (item: SiteAnnouncement) => {
    setEditing(item);
    setEditMessage(item.message);
    setEditLinkUrl(item.linkUrl ?? "");
    setEditAudience(item.audience);
    setEditPublished(item.published);
  };

  const closeEditDialog = () => {
    setEditing(null);
    setEditMessage("");
    setEditLinkUrl("");
    setEditAudience("all");
    setEditPublished(true);
  };

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => announcementsApi.listAll(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    queryClient.invalidateQueries({ queryKey: ["site-announcements"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      announcementsApi.create({
        message: message.trim(),
        linkUrl: linkUrl.trim() || undefined,
        audience,
        published: publishNow,
      }),
    onSuccess: () => {
      invalidate();
      setMessage("");
      setLinkUrl("");
      setAudience("all");
      setPublishNow(true);
      toast({ title: publishNow ? "Announcement published" : "Announcement saved as draft" });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not create announcement",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      announcementsApi.update(id, { published }),
    onSuccess: (_, vars) => {
      invalidate();
      toast({
        title: vars.published ? "Announcement published" : "Announcement unpublished",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast({ title: "Announcement removed" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      announcementsApi.update(editing!.id, {
        message: editMessage.trim(),
        linkUrl: editLinkUrl.trim() || null,
        audience: editAudience,
        published: editPublished,
      }),
    onSuccess: () => {
      invalidate();
      closeEditDialog();
      toast({ title: "Announcement updated" });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not update announcement",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  const isBusy =
    createMutation.isPending ||
    toggleMutation.isPending ||
    removeMutation.isPending ||
    updateMutation.isPending;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Message too short",
        description: "Enter at least 3 characters.",
      });
      return;
    }
    createMutation.mutate();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMessage.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Message too short",
        description: "Enter at least 3 characters.",
      });
      return;
    }
    updateMutation.mutate();
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Publish breaking news messages that scroll at the top of the site for students, employers, or everyone."
      />

      <form
        onSubmit={handleCreate}
        className="rounded-xl border bg-card p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">New announcement</h3>
        </div>

        <div>
          <Label htmlFor="announcement-message">Message</Label>
          <Textarea
            id="announcement-message"
            className="mt-1.5 min-h-[88px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="New feature: Project reviews are now live for all students!"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="announcement-link">Link (optional)</Label>
            <Input
              id="announcement-link"
              className="mt-1.5"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/blog/new-feature-update"
            />
          </div>
          <div>
            <Label>Audience</Label>
            <Select
              value={audience}
              onValueChange={(value) => setAudience(value as AnnouncementAudience)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="student">Students only</SelectItem>
                <SelectItem value="company">Employers only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <Switch checked={publishNow} onCheckedChange={setPublishNow} />
            <Label>Publish immediately</Label>
          </div>
          <Button type="submit" disabled={isBusy} className="gap-1.5 rounded-full">
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add announcement
          </Button>
        </div>
      </form>

      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-10 w-10" />}
          title="No announcements yet"
          description="Create your first message to show it in the breaking news ticker."
        />
      ) : (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">All announcements</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((item) => (
                  <AnnouncementRow
                    key={item.id}
                    item={item}
                    onToggle={(id, published) =>
                      toggleMutation.mutate({ id, published })
                    }
                    onEdit={openEditDialog}
                    onRemove={(id) => removeMutation.mutate(id)}
                    isBusy={isBusy}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-lg gap-6 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Edit announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-announcement-message">Message</Label>
              <Textarea
                id="edit-announcement-message"
                className="mt-1.5 min-h-[88px]"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-announcement-link">Link (optional)</Label>
                <Input
                  id="edit-announcement-link"
                  className="mt-1.5"
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  placeholder="/blog/new-feature-update"
                />
              </div>
              <div>
                <Label>Audience</Label>
                <Select
                  value={editAudience}
                  onValueChange={(value) =>
                    setEditAudience(value as AnnouncementAudience)
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="student">Students only</SelectItem>
                    <SelectItem value="company">Employers only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <Switch checked={editPublished} onCheckedChange={setEditPublished} />
                <Label>Published</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditDialog}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
