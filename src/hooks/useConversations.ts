import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// The WebSocket keeps this list current (and it is refetched on every reconnect), so it
// never goes stale on a timer.
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.getConversations(),
    staleTime: Infinity,
  });
}

// One conversation, read out of the cached list. Same key, so it shares the
// list's request and cache entry instead of calling a separate endpoint.
// staleTime must match: each hook decides for itself whether to refetch on mount.
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.getConversations(),
    staleTime: Infinity,
    select: (conversations) => conversations.find((c) => c.id === conversationId),
  });
}
