import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { setReadInList } from "@/lib/cache";
import { useConversation } from "@/hooks/useConversations";

// While a conversation is open, everything in it counts as read. Whenever its newest
// message is newer than what we've marked read, tell the server; the unread badge on the
// list follows. Other devices see the new count the next time they load the list.
export function useMarkRead(conversationId: string) {
  const queryClient = useQueryClient();
  const conversation = useConversation(conversationId).data;
  const lastSeq = conversation?.lastSeq ?? 0;
  const lastReadSeq = conversation?.lastReadSeq ?? 0;

  useEffect(() => {
    if (lastSeq <= lastReadSeq || document.visibilityState !== "visible") return;
    api
      .markRead(conversationId, lastSeq)
      .then((result) => setReadInList(queryClient, conversationId, result.lastReadSeq))
      .catch(() => {}); // not worth an error on screen: the next message tries again
  }, [conversationId, lastSeq, lastReadSeq, queryClient]);
}
