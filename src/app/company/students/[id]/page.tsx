"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bookmark,
  Code2,
  ExternalLink,
  Link2,
  Loader2,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { contactRequestsApi } from "@/lib/api/contactRequests";
import { bookmarksApi } from "@/lib/api/bookmarks";
import { studentsApi } from "@/lib/api/students";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";

const messageSchema = z.object({
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export default function CompanyStudentProfilePage() {
  const params = useParams();
  const studentId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: student, isLoading, error } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => studentsApi.getStudentWithUser(studentId),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["student-projects", studentId],
    queryFn: () => studentsApi.getProjects(studentId),
    enabled: !!studentId,
  });

  const { data: existingRequest } = useQuery({
    queryKey: ["existing-request", user?.id, studentId],
    queryFn: () => contactRequestsApi.getExistingRequest(user!.id, studentId),
    enabled: !!user && !!studentId,
  });

  const { data: isBookmarked = false } = useQuery({
    queryKey: ["bookmark", user?.id, studentId],
    queryFn: () => bookmarksApi.isBookmarked(user!.id, studentId),
    enabled: !!user && !!studentId,
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarksApi.toggle(user!.id, studentId),
    onSuccess: (added) => {
      queryClient.invalidateQueries({ queryKey: ["bookmark"] });
      queryClient.invalidateQueries({ queryKey: ["company-bookmarks"] });
      toast({
        title: added ? "Saved to bookmarks" : "Removed from bookmarks",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      contactRequestsApi.create(user!.id, { studentId, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["existing-request"] });
      queryClient.invalidateQueries({ queryKey: ["company-contact-requests"] });
      toast({ title: "Request sent", description: "The student will be notified." });
      setDialogOpen(false);
      form.reset();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: err instanceof Error ? err.message : "Could not send request",
      });
    },
  });

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (error || !student) return <ErrorState title="Student not found" />;

  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-brand/10 text-brand text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{student.fullName}</h1>
                <p className="text-muted-foreground">
                  RCA Class of {student.cohortYear}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {student.availability.map((a) => (
                    <Badge key={a} variant="outline" className="capitalize text-xs">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {existingRequest ? (
              <StatusBadge status={existingRequest.status} />
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={isBookmarked ? "text-primary border-primary" : ""}
                  onClick={() => bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isPending}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Contact Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact {student.fullName}</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={form.handleSubmit((d) =>
                      sendMutation.mutate(d.message)
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Your message</Label>
                      <Textarea
                        rows={4}
                        placeholder="Introduce your company and the opportunity..."
                        {...form.register("message")}
                      />
                      {form.formState.errors.message && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit" disabled={sendMutation.isPending}>
                      {sendMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Send request
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            )}
          </div>

          {student.bio && (
            <p className="mt-4 text-muted-foreground">{student.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {student.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex gap-4">
            {student.links.github && (
              <a
                href={student.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand hover:underline"
              >
                <Code2 className="h-4 w-4" /> GitHub
              </a>
            )}
            {student.links.linkedin && (
              <a
                href={student.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand hover:underline"
              >
                <Link2 className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {student.links.portfolio && (
              <a
                href={student.links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Portfolio
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">No projects listed.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} readOnly />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
