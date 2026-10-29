import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) => api.getMessages(conversationId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // New messages arrive over the WebSocket and are written into this cache, so there's
    // nothing to gain from refetching it on a timer.
    staleTime: Infinity,
  });
}
