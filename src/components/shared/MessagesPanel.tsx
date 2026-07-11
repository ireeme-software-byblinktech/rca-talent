"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  messagesApi,
  type ConversationWithParticipant,
  type MessageableContact,
} from "@/lib/api/messages";
import { cn, formatRelativeDate } from "@/lib/utils";

interface MessagesPanelProps {
  userId: string;
}

type ThreadItem = {
  key: string;
  otherUserId: string;
  displayName: string;
  email: string;
  role: string;
  conversationId: string | null;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
};

function buildThreads(
  conversations: ConversationWithParticipant[],
  contacts: MessageableContact[]
): ThreadItem[] {
  const byUserId = new Map<string, ThreadItem>();

  for (const contact of contacts) {
    byUserId.set(contact.userId, {
      key: contact.userId,
      otherUserId: contact.userId,
      displayName: contact.displayName,
      email: contact.email,
      role: contact.role.toLowerCase(),
      conversationId: null,
      lastMessage: "",
      updatedAt: contact.lastContactAt,
      unreadCount: 0,
    });
  }

  for (const conv of conversations) {
    const existing = byUserId.get(conv.otherUser.id);
    byUserId.set(conv.otherUser.id, {
      key: conv.id,
      otherUserId: conv.otherUser.id,
      displayName: conv.displayName,
      email: conv.otherUser.email,
      role: conv.otherUser.role,
      conversationId: conv.id,
      lastMessage: conv.lastMessage,
      updatedAt: conv.updatedAt,
      unreadCount: conv.unreadCount,
    });
    if (existing && !conv.lastMessage && existing.lastMessage) {
      byUserId.get(conv.otherUser.id)!.lastMessage = existing.lastMessage;
    }
  }

  return Array.from(byUserId.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function MessagesPanel({ userId }: MessagesPanelProps) {
  const queryClient = useQueryClient();
  const [activeOtherUserId, setActiveOtherUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: convosLoading } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => messagesApi.getConversations(userId),
    enabled: !!userId,
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["message-contacts", userId],
    queryFn: () => messagesApi.getMessageableContacts(userId),
    enabled: !!userId,
  });

  const threads = useMemo(
    () => buildThreads(conversations, contacts),
    [conversations, contacts]
  );

  const activeThread = threads.find((t) => t.otherUserId === activeOtherUserId);
  const activeConvId = activeThread?.conversationId ?? null;

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", activeConvId, userId],
    queryFn: () => messagesApi.getMessages(activeConvId!, userId),
    enabled: !!activeConvId && !!userId,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      messagesApi.send(
        activeConvId,
        userId,
        activeThread!.otherUserId,
        draft.trim()
      ),
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
      await queryClient.invalidateQueries({ queryKey: ["message-contacts", userId] });
      if (activeConvId) {
        queryClient.invalidateQueries({ queryKey: ["messages", activeConvId] });
      } else {
        const updated = await messagesApi.getConversations(userId);
        const match = updated.find((c) => c.otherUser.id === activeOtherUserId);
        if (match) {
          setActiveOtherUserId(match.otherUser.id);
          queryClient.invalidateQueries({ queryKey: ["messages", match.id] });
        }
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeOtherUserId && threads.length > 0) {
      setActiveOtherUserId(threads[0].otherUserId);
    }
  }, [threads, activeOtherUserId]);

  const isLoading = convosLoading || contactsLoading;

  if (isLoading) return <LoadingSkeleton rows={4} />;

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-8 w-8" />}
        title="No conversations yet"
        description="Messaging unlocks after a contact request is accepted. Companies send a request from Find Talent; students accept it under Requests."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border bg-card">
      <div className="w-72 shrink-0 overflow-y-auto border-r">
        {threads.map((thread) => (
          <button
            key={thread.key}
            type="button"
            onClick={() => setActiveOtherUserId(thread.otherUserId)}
            className={cn(
              "flex w-full items-start gap-3 border-b p-4 text-left transition-colors hover:bg-secondary/50",
              activeOtherUserId === thread.otherUserId && "bg-primary/10"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {thread.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {thread.displayName}
                </span>
                {thread.unreadCount > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {thread.lastMessage || "Start a conversation"}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {formatRelativeDate(thread.updatedAt)}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {activeThread ? (
          <>
            <div className="border-b px-4 py-3">
              <p className="font-medium">{activeThread.displayName}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {activeThread.role}
                {activeThread.email ? ` · ${activeThread.email}` : ""}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {!activeConvId ? (
                <p className="text-center text-sm text-muted-foreground">
                  Send a message to start chatting with {activeThread.displayName}.
                </p>
              ) : msgsLoading ? (
                <LoadingSkeleton rows={3} />
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No messages yet. Say hello!
                </p>
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
