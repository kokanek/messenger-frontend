import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { refreshTokens } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { addIfMissing, applyToConversationList, newestSeq } from "@/lib/cache";
import type { Message, ServerEvent } from "@/types";

const WS_URL = import.meta.env.VITE_WS_URL ?? `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;

// One WebSocket for the whole app, while someone is signed in (backend spec, section 8).
// It only receives: sending goes over HTTP POST.
export function useSocket() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;
    let socket: WebSocket | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let stopped = false;

    function onEvent(event: ServerEvent) {
      if (event.type === "ready") {
        attempt = 0;
        // Pushes sent while we were disconnected never arrive, so refetch. An infinite
        // query refetches its loaded pages in order, so nothing is skipped or doubled.
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        return;
      }
      if (event.type === "message.created") {
        const message = event.payload as Message;
        const key = ["messages", message.conversationId];
        const thread = queryClient.getQueryData<Parameters<typeof addIfMissing>[0]>(key);
        if (thread && message.seq > newestSeq(thread) + 1) {
          queryClient.invalidateQueries({ queryKey: key }); // we missed some: refetch the thread
        } else {
          queryClient.setQueryData(key, (old: typeof thread) => addIfMissing(old, message));
        }
        // A conversation we don't have yet (someone just started it): reload the list.
        if (applyToConversationList(queryClient, message, userId!) === "unknown") {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      }
    }

    function connect() {
      socket = new WebSocket(WS_URL);
      // The first frame must prove who we are, within 5 seconds.
      socket.onopen = () => {
        socket!.send(JSON.stringify({ type: "auth", payload: { token: useAuthStore.getState().accessToken } }));
      };
      socket.onmessage = (e) => onEvent(JSON.parse(e.data) as ServerEvent);
      socket.onclose = async (e) => {
        if (stopped) return;
        if (e.code === 4401) {
          // The access token was rejected (probably expired): get a new one first.
          try {
            await refreshTokens();
          } catch {
            return; // the refresh token is no good either: the app goes to the login page
          }
        }
        // Reconnect with exponential backoff: 1 s, 2 s, 4 s... up to 30 s, plus jitter so
        // a server restart isn't followed by every client reconnecting at the same instant.
        const delay = Math.min(30_000, 1000 * 2 ** attempt) + Math.random() * 1000;
        attempt++;
        retryTimer = setTimeout(connect, delay);
      };
    }

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      socket?.close();
    };
  }, [userId, queryClient]);
}
