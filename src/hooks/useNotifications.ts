"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { useAuth } from "@/lib/auth/context";

/**
 * Stub hook for in-app notifications.
 * TODO: Replace polling with WebSocket connection when backend is ready.
 */
export function useNotifications() {
  const { user } = useAuth();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationsApi.getForUser(user!.id),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    refetch();
  };

  const markAllAsRead = async () => {
    if (user) {
      await notificationsApi.markAllAsRead(user.id);
      refetch();
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
    // TODO: WebSocket connection stub
    isConnected: false,
  };
}
