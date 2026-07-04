"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesPanel } from "@/components/shared/MessagesPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { InterviewInvitationCard } from "@/components/shared/InterviewInvitationCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { interviewsApi } from "@/lib/api/interviews";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["student-interviews", user?.id],
    queryFn: () => interviewsApi.getForStudent(user!.id),
    enabled: !!user,
  });

  const respondMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "accepted" | "declined";
    }) => interviewsApi.respond(id, user!.id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["student-interviews"] });
      toast({ title: status === "accepted" ? "Interview accepted" : "Interview declined" });
    },
  });

  const pendingCount = interviews.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages & Interviews"
        description="Chat with recruiters and manage interview invitations"
      />

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="interviews">
            Interviews
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4">
          {user && <MessagesPanel userId={user.id} />}
        </TabsContent>

        <TabsContent value="interviews" className="mt-4 space-y-4">
          {isLoading ? (
            <LoadingSkeleton rows={3} />
          ) : interviews.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-8 w-8" />}
              title="No interview invitations"
              description="When a company invites you to interview, it will appear here."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {interviews.map((inv) => (
                <InterviewInvitationCard
                  key={inv.id}
                  interview={inv}
                  variant="student"
                  jobTitle={inv.job?.title}
                  isLoading={respondMutation.isPending}
                  onAccept={() =>
                    respondMutation.mutate({ id: inv.id, status: "accepted" })
                  }
                  onDecline={() =>
                    respondMutation.mutate({ id: inv.id, status: "declined" })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
