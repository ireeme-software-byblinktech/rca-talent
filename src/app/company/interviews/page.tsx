"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { InterviewInvitationCard } from "@/components/shared/InterviewInvitationCard";
import { contactRequestsApi } from "@/lib/api/contactRequests";
import { interviewsApi } from "@/lib/api/interviews";
import { jobsApi } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const inviteSchema = z.object({
  studentId: z.string().min(1),
  jobId: z.string().optional(),
  scheduledAt: z.string().min(1),
  location: z.string().min(2),
  message: z.string().min(10),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function CompanyInterviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { location: "TechKigali Office, Kigali" },
  });

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["company-interviews", user?.id],
    queryFn: () => interviewsApi.getForCompany(user!.id),
    enabled: !!user,
  });

  const { data: candidates = [], isLoading: candidatesLoading, isError: candidatesError } = useQuery({
    queryKey: ["company-candidates", user?.id],
    queryFn: () => contactRequestsApi.getAcceptedCandidates(user!.id),
    enabled: !!user,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["company-jobs", user?.id],
    queryFn: () => jobsApi.getForCompany(user!.id),
    enabled: !!user,
  });

  const acceptedCandidates = candidates;

  const stats = useMemo(
    () => ({
      pending: interviews.filter((i) => i.status === "pending").length,
      upcoming: interviews.filter((i) => i.status === "accepted").length,
      completed: interviews.filter((i) => i.status === "completed").length,
    }),
    [interviews]
  );

  const createMutation = useMutation({
    mutationFn: (data: InviteForm) =>
      interviewsApi.create(user!.id, {
        studentId: data.studentId,
        jobId: data.jobId || undefined,
        scheduledAt: data.scheduledAt,
        location: data.location,
        message: data.message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-interviews"] });
      toast({ title: "Interview invitation sent" });
      setOpen(false);
      form.reset({ location: "TechKigali Office, Kigali" });
    },
    onError: (err) => {
      toast({
        title: "Could not send invitation",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "completed" | "declined" }) =>
      interviewsApi.updateStatus(user!.id, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-interviews"] });
      toast({ title: "Interview updated" });
    },
  });

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Invitations"
        description="Schedule and track interviews with candidates"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full">
              <Plus className="h-4 w-4" />
              Send invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule interview</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-4"
            >
              <div>
                <Label>Candidate</Label>
                <Select
                  value={form.watch("studentId")}
                  onValueChange={(v) => form.setValue("studentId", v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {acceptedCandidates.map((candidate) => (
                      <SelectItem key={candidate.userId} value={candidate.userId}>
                        {candidate.fullName}
                        {candidate.cohortYear
                          ? ` · Class of ${candidate.cohortYear}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {candidatesLoading ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Loading candidates…
                  </p>
                ) : candidatesError ? (
                  <p className="mt-1 text-xs text-destructive">
                    Could not load candidates. Please refresh and try again.
                  </p>
                ) : acceptedCandidates.length === 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Accept a contact request first to invite a candidate. Send one from a student profile in Find Talent.
                  </p>
                ) : null}
              </div>
              <div>
                <Label>Related job (optional)</Label>
                <Select
                  value={form.watch("jobId") ?? ""}
                  onValueChange={(v) => form.setValue("jobId", v || undefined)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.filter((j) => j.status === "open").map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date & time</Label>
                <Input type="datetime-local" className="mt-1.5" {...form.register("scheduledAt")} />
              </div>
              <div>
                <Label>Location</Label>
                <Input className="mt-1.5" {...form.register("location")} />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  className="mt-1.5"
                  {...form.register("message")}
                  rows={3}
                  placeholder="We'd like to invite you for a technical interview..."
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={createMutation.isPending || candidatesLoading || acceptedCandidates.length === 0}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send invitation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {interviews.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Awaiting response", count: stats.pending, color: "text-amber-600" },
            { label: "Upcoming", count: stats.upcoming, color: "text-emerald-600" },
            { label: "Completed", count: stats.completed, color: "text-primary" },
          ].map((s) => (
            <div
              key={s.label}
              className="fancy-card rounded-2xl border border-border/50 p-4 !translate-y-0 !shadow-card"
            >
              <p className={cn("text-sm font-medium", s.color)}>● {s.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title="No interviews scheduled"
          description="Send interview invitations to candidates who accepted your contact requests."
          action={
            acceptedCandidates.length > 0
              ? { label: "Send invitation", onClick: () => setOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {interviews.map((inv) => (
            <InterviewInvitationCard
              key={inv.id}
              interview={inv}
              variant="company"
              jobTitle={inv.job?.title}
              isLoading={updateMutation.isPending}
              onMarkCompleted={() =>
                updateMutation.mutate({ id: inv.id, status: "completed" })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
