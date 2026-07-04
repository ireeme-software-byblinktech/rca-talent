"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { messagesApi } from "@/lib/api/messages";
import { cn, formatRelativeDate } from "@/lib/utils";

interface MessagesPanelProps {
  userId: string;
}

export function MessagesPanel({ userId }: MessagesPanelProps) {
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => messagesApi.getConversations(userId),
    enabled: !!userId,
  });

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", activeConvId, userId],
    queryFn: () => messagesApi.getMessages(activeConvId!, userId),
    enabled: !!activeConvId && !!userId,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      messagesApi.send(
        activeConvId!,
        userId,
        activeConv!.otherUser.id,
        draft.trim()
      ),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  if (isLoading) return <LoadingSkeleton rows={4} />;

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Messages appear here after a contact request is accepted."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border bg-card">
      <div className="w-72 shrink-0 overflow-y-auto border-r">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            type="button"
            onClick={() => setActiveConvId(conv.id)}
            className={cn(
              "flex w-full items-start gap-3 border-b p-4 text-left transition-colors hover:bg-secondary/50",
              activeConvId === conv.id && "bg-primary/10"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {conv.otherUser.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {conv.otherUser.email}
                </span>
                {conv.unreadCount > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {conv.lastMessage}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {formatRelativeDate(conv.updatedAt)}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {activeConv ? (
          <>
            <div className="border-b px-4 py-3">
              <p className="font-medium">{activeConv.otherUser.email}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {activeConv.otherUser.role}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgsLoading ? (
                <LoadingSkeleton rows={3} />
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", isMine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        )}
                      >
                        {msg.body}
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {formatRelativeDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              className="flex gap-2 border-t p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) sendMutation.mutate();
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMutation.isPending}
              />
              <Button type="submit" size="icon" disabled={!draft.trim() || sendMutation.isPending}>
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
