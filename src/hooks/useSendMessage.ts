import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { addToNewestPage, applyToConversationList, markFailed, markSending, replaceByClientMessageId } from "@/lib/cache";
import type { Message, ThreadMessage } from "@/types";

// Sending, as code/frontend-architecture.md describes: show the message at once as
// pending, POST it, then swap in the server's copy (matched by clientMessageId), or mark it
// failed so the user can retry. The thread is never refetched just to show one message.
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const key = ["messages", conversationId];

  const mutation = useMutation({
    mutationFn: (message: ThreadMessage) => api.sendMessage(conversationId, { clientMessageId: message.clientMessageId, text: message.text }),
    onMutate: (message) => {
      queryClient.setQueryData(key, (old: Parameters<typeof addToNewestPage>[0]) =>
        message.status === "failed" ? markSending(old, message.clientMessageId) : addToNewestPage(old, { ...message, status: "sending" }),
      );
    },
    onSuccess: (saved: Message, message) => {
      queryClient.setQueryData(key, (old: Parameters<typeof replaceByClientMessageId>[0]) =>
        replaceByClientMessageId(old, message.clientMessageId, saved),
      );
      applyToConversationList(queryClient, saved, saved.authorId);
    },
    onError: (_err, message) => {
      queryClient.setQueryData(key, (old: Parameters<typeof markFailed>[0]) => markFailed(old, message.clientMessageId));
    },
  });

  return {
    send(text: string) {
      const user = useAuthStore.getState().user!;
      mutation.mutate({
        id: crypto.randomUUID(), // placeholder until the server assigns the real id
        clientMessageId: crypto.randomUUID(), // the same clientMessageId on a retry, so it's stored once
        conversationId,
        seq: 0,
        authorId: user.id,
        authorName: user.displayName,
        text,
        createdAt: new Date().toISOString(),
        status: "sending",
      });
    },
    retry(message: ThreadMessage) {
      mutation.mutate({ ...message, status: "failed" });
    },
  };
}
