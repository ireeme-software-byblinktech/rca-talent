"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAuthToken } from "@/lib/api/client";
import { getApiOrigin, isMockMode } from "@/lib/config/env";
import type { Message } from "@/types";

export type MessageNewEvent = Pick<
  Message,
  | "id"
  | "conversationId"
  | "senderId"
  | "recipientId"
  | "body"
  | "read"
  | "createdAt"
>;

type Options = {
  userId: string | null | undefined;
  enabled?: boolean;
  onMessageNew?: (message: MessageNewEvent) => void;
};

/**
 * Connects to the NestJS messages Socket.IO namespace and listens for realtime events.
 * Reconnects when the access token changes (refresh).
 */
export function useMessagesSocket({
  userId,
  enabled = true,
  onMessageNew,
}: Options) {
  const onMessageNewRef = useRef(onMessageNew);
  onMessageNewRef.current = onMessageNew;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !userId || isMockMode()) {
      setConnected(false);
      return;
    }

    let socket: Socket | null = null;
    let cancelled = false;

    const connect = () => {
      const token = getAuthToken();
      if (!token || cancelled) return;

      socket?.removeAllListeners();
      socket?.disconnect();

      socket = io(`${getApiOrigin()}/messages`, {
        auth: { token },
        transports: ["websocket", "polling"],
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      socket.on("connect", () => {
        if (!cancelled) setConnected(true);
      });
      socket.on("disconnect", () => {
        if (!cancelled) setConnected(false);
      });
      socket.on("connect_error", () => {
        if (!cancelled) setConnected(false);
      });
      socket.on("message:new", (payload: MessageNewEvent) => {
        onMessageNewRef.current?.(payload);
      });
    };

    connect();

    // Re-auth when access token is refreshed in another part of the app.
    const pollId = setInterval(() => {
      const token = getAuthToken();
      if (!token || !socket) return;
      const currentAuth = (socket.auth as { token?: string } | undefined)?.token;
      if (token !== currentAuth) {
        socket.auth = { token };
        if (socket.connected) {
          socket.disconnect().connect();
        } else {
          connect();
        }
      }
    }, 15_000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      socket?.removeAllListeners();
      socket?.disconnect();
      setConnected(false);
    };
  }, [userId, enabled]);

  return { connected };
}
