import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { Conversation, Message, User } from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export interface ConversationWithParticipant extends Conversation {
  otherUser: User;
  unreadCount: number;
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
            unreadCount: msgs.filter((m) => m.recipientId === userId && !m.read).length,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    return apiClient<ConversationWithParticipant[]>(
      `/messages/conversations/${userId}`
    );
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
    return apiClient<Message[]>(`/messages/${conversationId}`);
  },

  async send(
    conversationId: string,
    senderId: string,
    recipientId: string,
    body: string
  ): Promise<Message> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const msg: Message = {
        id: generateId("msg"),
        conversationId,
        senderId,
        recipientId,
        body,
        read: false,
        createdAt: new Date().toISOString(),
      };
      store.messages.push(msg);
      const conv = store.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = body;
        conv.updatedAt = msg.createdAt;
      }
      return msg;
    }
    const { apiClient } = await import("./client");
    return apiClient<Message>(`/messages/${conversationId}`, {
      method: "POST",
      body: { body, recipientId },
    });
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
    return apiClient<Conversation>("/messages/conversations", {
      method: "POST",
      body: { otherUserId, initialMessage },
    });
  },
};
