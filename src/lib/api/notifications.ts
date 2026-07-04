import { getStore, simulateDelay } from "@/lib/mock/store";
import type { Notification } from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

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
    return apiClient<Notification[]>(`/notifications/${userId}`);
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
