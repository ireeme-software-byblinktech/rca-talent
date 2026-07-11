"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Newspaper, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminBlogPostCard } from "@/components/admin/AdminBlogPostCard";
import { AdminMetricStrip } from "@/components/admin/AdminMetricStrip";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { blogApi, type CreateBlogPostData } from "@/lib/api/blog";
import { slugify } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@/types";

const postSchema = z.object({
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  author: z.string().min(2, "Author is required"),
  tags: z.string().min(1, "Add at least one tag"),
});

type PostForm = z.infer<typeof postSchema>;

function PostDialog({ post, onClose }: { post?: BlogPost; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [published, setPublished] = useState(post?.published ?? true);
  const isNew = !post;

  const form = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: post
      ? {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          tags: post.tags.join(", "),
        }
      : { author: "RCA Talent Team", slug: "", title: "", excerpt: "", content: "", tags: "" },
  });

  const title = form.watch("title");

  useEffect(() => {
    if (isNew && title.trim()) {
      form.setValue("slug", slugify(title), { shouldValidate: true });
    }
  }, [title, isNew, form]);

  const mutation = useMutation({
    mutationFn: (data: PostForm) => {
      const payload: CreateBlogPostData = {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        published,
      };
      return post ? blogApi.update(post.id, payload) : blogApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: post ? "Post updated" : "Post created" });
      onClose();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: post ? "Could not update post" : "Could not create post",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  const fieldError = (name: keyof PostForm) =>
    form.formState.errors[name]?.message as string | undefined;

  return (
    <form
      onSubmit={form.handleSubmit(
        (d) => mutation.mutate(d),
        (errors) => {
          const first = Object.values(errors)[0]?.message;
          toast({
            variant: "destructive",
            title: "Fix the form before submitting",
            description:
              typeof first === "string"
                ? first
                : "Check title, excerpt, content, and tags.",
          });
        }
      )}
      className="space-y-5 max-h-[70vh] overflow-y-auto px-1 pb-2"
    >
      <div>
        <Label>Title</Label>
        <Input className="mt-1.5" {...form.register("title")} placeholder="Enter post title" />
        {fieldError("title") && (
          <p className="mt-1 text-xs text-destructive">{fieldError("title")}</p>
        )}
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          className="mt-1.5 bg-muted/40"
          readOnly
          {...form.register("slug")}
          placeholder="auto-generated-from-title"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {isNew
            ? "Auto-generated from the title. URL will be /blog/your-slug"
            : "Slug is fixed after publishing to keep URLs stable."}
        </p>
      </div>
      <div>
        <Label>Author</Label>
        <Input className="mt-1.5" {...form.register("author")} />
      </div>
      <div>
        <Label>Excerpt</Label>
        <Textarea className="mt-1.5" {...form.register("excerpt")} rows={2} />
        {fieldError("excerpt") && (
          <p className="mt-1 text-xs text-destructive">{fieldError("excerpt")}</p>
        )}
      </div>
      <div>
        <Label>Content (use ## for headings)</Label>
        <Textarea className="mt-1.5" {...form.register("content")} rows={8} />
        {fieldError("content") && (
          <p className="mt-1 text-xs text-destructive">{fieldError("content")}</p>
        )}
      </div>
      <div>
        <Label>Tags (comma-separated)</Label>
        <Input className="mt-1.5" {...form.register("tags")} placeholder="RCA, Careers" />
        {fieldError("tags") && (
          <p className="mt-1 text-xs text-destructive">{fieldError("tags")}</p>
        )}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
        <Label>Published</Label>
        <Switch checked={published} onCheckedChange={setPublished} />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {post ? "Update post" : "Create post"}
      </Button>
    </form>
  );
}

export default function AdminBlogPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | undefined>();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: () => blogApi.listAll(),
  });

  const { data: subscriberCount = 0 } = useQuery({
    queryKey: ["blog-subscriber-count"],
    queryFn: () => blogApi.getSubscriberCount(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Post deleted" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      blogApi.update(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
  });

  const metrics = useMemo(
    () => [
      { label: "Total posts", value: posts.length, color: "text-primary" },
      { label: "Published", value: posts.filter((p) => p.published).length, color: "text-emerald-600" },
      { label: "Drafts", value: posts.filter((p) => !p.published).length, color: "text-amber-600" },
      { label: "Subscribers", value: subscriberCount, color: "text-sky-600" },
    ],
    [posts, subscriberCount]
  );

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Blog Management" description="Create and manage blog posts">
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditing(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-1.5 rounded-full" onClick={() => setEditing(undefined)}>
              <Plus className="h-4 w-4" />
              New post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl gap-6 rounded-2xl p-6 sm:p-8">
            <DialogHeader className="space-y-2">
              <DialogTitle>{editing ? "Edit post" : "New blog post"}</DialogTitle>
            </DialogHeader>
            <PostDialog post={editing} onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <AdminMetricStrip metrics={metrics} />

      {posts.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-10 w-10" />}
          title="No blog posts"
          description="Create your first post to get started."
          action={{ label: "New post", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, i) => (
            <AdminBlogPostCard
              key={post.id}
              post={post}
              index={i}
              isToggling={toggleMutation.isPending}
              onEdit={() => {
                setEditing(post);
                setDialogOpen(true);
              }}
              onDelete={() => deleteMutation.mutate(post.id)}
              onTogglePublish={(published) =>
                toggleMutation.mutate({ id: post.id, published })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
