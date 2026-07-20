import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { Conversation, Message, User } from "@/types";
import { mapUser, type BackendUser } from "./mappers";

const USE_MOCK = isMockMode();

export interface ConversationWithParticipant extends Conversation {
  otherUser: User;
  displayName: string;
  unreadCount: number;
}

export interface MessageableContact {
  userId: string;
  email: string;
  role: string;
  displayName: string;
  lastContactAt: string;
}

function displayNameFromOtherUser(
  otherRaw: Record<string, unknown> | undefined,
  fallbackId: string
): string {
  if (!otherRaw) return "User";
  const companyProfile = otherRaw.companyProfile as
    | Record<string, unknown>
    | undefined;
  const studentProfile = otherRaw.studentProfile as
    | Record<string, unknown>
    | undefined;
  if (companyProfile?.companyName) {
    return String(companyProfile.companyName);
  }
  if (studentProfile) {
    const name = [studentProfile.firstName, studentProfile.lastName]
      .filter(Boolean)
      .join(" ");
    if (name) return name;
  }
  if (otherRaw.displayName) return String(otherRaw.displayName);
  if (otherRaw.email) return String(otherRaw.email);
  return fallbackId;
}

function mapBackendConversation(
  raw: Record<string, unknown>,
  userId: string
): ConversationWithParticipant {
  const participantIds = raw.participantIds as string[];
  const otherRaw = raw.otherUser as Record<string, unknown> | undefined;
  const otherId = participantIds.find((id) => id !== userId) ?? "";
  const displayName = displayNameFromOtherUser(otherRaw, otherId);

  return {
    id: raw.id as string,
    participantIds: participantIds as [string, string],
    lastMessage: (raw.lastMessage as string) ?? "",
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    otherUser: otherRaw
      ? mapUser(otherRaw as unknown as BackendUser)
      : {
          id: otherId,
          email: "",
          role: "student",
          createdAt: new Date().toISOString(),
          isActive: true,
        },
    displayName,
    unreadCount: 0,
  };
}

function mapBackendMessage(raw: Record<string, unknown>): Message {
  return {
    id: raw.id as string,
    conversationId: raw.conversationId as string,
    senderId: raw.senderId as string,
    recipientId: raw.recipientId as string,
    body: (raw.body as string) ?? (raw.content as string) ?? "",
    read: (raw.read as boolean) ?? false,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export const messagesApi = {
  async getConversations(userId: string): Promise<ConversationWithParticipant[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.conversations
        .filter((c) => c.participantIds.includes(userId))
        .map((conv) => {
          const otherId = conv.participantIds.find((id) => id !== userId)!;
          const msgs = store.messages.filter((m) => m.conversationId === conv.id);
          return {
            ...conv,
            otherUser: store.users.find((u) => u.id === otherId)!,
            displayName:
              store.companyProfiles.find((p) => p.userId === otherId)?.companyName ??
              store.studentProfiles.find((p) => p.userId === otherId)?.fullName ??
              store.users.find((u) => u.id === otherId)?.email ??
              "User",
            unreadCount: msgs.filter((m) => m.recipientId === userId && !m.read).length,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/messages/conversations/${userId}`
    );
    return raw.map((c) => mapBackendConversation(c, userId));
  },

  async getMessageableContacts(_userId: string): Promise<MessageableContact[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const seen = new Set<string>();
      const contacts: MessageableContact[] = [];
      for (const request of store.contactRequests.filter((r) => r.status === "accepted")) {
        const otherId =
          request.companyId === _userId ? request.studentId : request.companyId;
        if (seen.has(otherId)) continue;
        seen.add(otherId);
        const company = store.companyProfiles.find((p) => p.userId === otherId);
        const student = store.studentProfiles.find((p) => p.userId === otherId);
        const user = store.users.find((u) => u.id === otherId);
        contacts.push({
          userId: otherId,
          email: user?.email ?? "",
          role: user?.role ?? "student",
          displayName: company?.companyName ?? student?.fullName ?? user?.email ?? "User",
          lastContactAt: request.respondedAt ?? request.createdAt,
        });
      }
      return contacts;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<
      Array<{
        userId: string;
        email: string;
        role: string;
        displayName: string;
        lastContactAt: string | Date;
      }>
    >("/messages/contacts");
    return raw.map((c) => ({
      ...c,
      lastContactAt: String(c.lastContactAt),
    }));
  },

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      store.messages
        .filter((m) => m.conversationId === conversationId && m.recipientId === userId)
        .forEach((m) => {
          m.read = true;
        });
      return store.messages
        .filter((m) => m.conversationId === conversationId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/messages/${conversationId}`
    );
    return raw.map(mapBackendMessage);
  },

  async send(
    conversationId: string | null,
    _senderId: string,
    recipientId: string,
    body: string
  ): Promise<Message> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const msg: Message = {
        id: generateId("msg"),
        conversationId: conversationId ?? generateId("conv"),
        senderId: _senderId,
        recipientId,
        body,
        read: false,
        createdAt: new Date().toISOString(),
      };
      store.messages.push(msg);
      const conv = conversationId
        ? store.conversations.find((c) => c.id === conversationId)
        : store.conversations.find(
            (c) =>
              c.participantIds.includes(_senderId) &&
              c.participantIds.includes(recipientId)
          );
      if (conv) {
        conv.lastMessage = body;
        conv.updatedAt = msg.createdAt;
      }
      return msg;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>("messages", {
      method: "POST",
      body: { recipientId, content: body },
    });
    return mapBackendMessage(raw);
  },

  async startConversation(
    userId: string,
    otherUserId: string,
    initialMessage: string
  ): Promise<Conversation> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const existing = store.conversations.find(
        (c) =>
          c.participantIds.includes(userId) &&
          c.participantIds.includes(otherUserId)
      );
      if (existing) {
        await this.send(existing.id, userId, otherUserId, initialMessage);
        return existing;
      }
      const conv: Conversation = {
        id: generateId("conv"),
        participantIds: [userId, otherUserId],
        lastMessage: initialMessage,
        updatedAt: new Date().toISOString(),
      };
      store.conversations.push(conv);
      await this.send(conv.id, userId, otherUserId, initialMessage);
      return conv;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>("messages", {
      method: "POST",
      body: { recipientId: otherUserId, content: initialMessage },
    });
    const msg = mapBackendMessage(raw);
    return {
      id: msg.conversationId,
      participantIds: [userId, otherUserId],
      lastMessage: initialMessage,
      updatedAt: msg.createdAt,
    };
  },
};
