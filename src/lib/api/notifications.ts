import { isMockMode } from "@/lib/config/env";
import { getStore, simulateDelay } from "@/lib/mock/store";
import type { Notification } from "@/types";

const USE_MOCK = isMockMode();

function mapBackendNotification(raw: Record<string, unknown>): Notification {
  const typeMap: Record<string, Notification["type"]> = {
    VERIFICATION_APPROVED: "verification",
    VERIFICATION_REJECTED: "verification",
    CONTACT_REQUEST_SENT: "contact_request",
    CONTACT_REQUEST_ACCEPTED: "contact_request",
    CONTACT_REQUEST_REJECTED: "contact_request",
    SYSTEM_ANNOUNCEMENT: "system",
  };

  return {
    id: raw.id as string,
    userId: (raw.userId as string) ?? "",
    title: (raw.title as string) ?? "",
    message: (raw.message as string) ?? (raw.body as string) ?? "",
    read: (raw.read as boolean) ?? (raw.isRead as boolean) ?? false,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    type: typeMap[(raw.type as string) ?? ""] ?? "system",
  };
}

export const notificationsApi = {
  async getForUser(userId: string): Promise<Notification[]> {
    if (USE_MOCK) {
      await simulateDelay(100);
      const store = getStore();
      return store.notifications
        .filter((n) => n.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/notifications/${userId}`
    );
    return raw.map(mapBackendNotification);
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay(100);
      const store = getStore();
      const idx = store.notifications.findIndex((n) => n.id === notificationId);
      if (idx !== -1) store.notifications[idx].read = true;
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay(100);
      const store = getStore();
      store.notifications
        .filter((n) => n.userId === userId)
        .forEach((n) => {
          n.read = true;
        });
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/notifications/${userId}/read-all`, {
      method: "PATCH",
    });
  },
};
