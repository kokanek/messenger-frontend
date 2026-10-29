import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ConversationSummary, Message, MessagesPage, ThreadMessage } from "@/types";

// Helpers that write into the React Query cache, the only place messages live
// (code/frontend-architecture.md). Each returns new objects and never mutates the cache.

type Thread = InfiniteData<MessagesPage, string | null>;

// pages[0] is the newest page; within a page, messages are oldest first. So "the newest
// message" is the end of pages[0].

function mapMessages(thread: Thread, fn: (m: ThreadMessage) => ThreadMessage): Thread {
  return { ...thread, pages: thread.pages.map((page) => ({ ...page, messages: page.messages.map(fn) })) };
}

// A message this device is sending: shown at once, styled as pending.
export function addToNewestPage(thread: Thread | undefined, message: ThreadMessage): Thread | undefined {
  if (!thread) return thread;
  const [newest, ...older] = thread.pages;
  return { ...thread, pages: [{ ...newest!, messages: [...newest!.messages, message] }, ...older] };
}

// The server confirmed a send: swap the pending copy for the saved one.
export function replaceByClientMessageId(thread: Thread | undefined, clientMessageId: string, saved: Message): Thread | undefined {
  return thread && mapMessages(thread, (m) => (m.clientMessageId === clientMessageId ? saved : m));
}

export function markFailed(thread: Thread | undefined, clientMessageId: string): Thread | undefined {
  return thread && mapMessages(thread, (m) => (m.clientMessageId === clientMessageId ? { ...m, status: "failed" } : m));
}

export function markSending(thread: Thread | undefined, clientMessageId: string): Thread | undefined {
  return thread && mapMessages(thread, (m) => (m.clientMessageId === clientMessageId ? { ...m, status: "sending" } : m));
}

// A message from the server (a POST response or a socket push). The sender gets their own
// message back over the socket too, so match on clientMessageId and never add it twice.
export function addIfMissing(thread: Thread | undefined, message: Message): Thread | undefined {
  if (!thread) return thread;
  const exists = thread.pages.some((page) => page.messages.some((m) => m.clientMessageId === message.clientMessageId));
  if (exists) return replaceByClientMessageId(thread, message.clientMessageId, message);

  // Keep confirmed messages in seq order, with this device's pending ones after them.
  const [newest, ...older] = thread.pages;
  const confirmed = newest!.messages.filter((m) => !m.status);
  const pending = newest!.messages.filter((m) => m.status);
  return { ...thread, pages: [{ ...newest!, messages: [...confirmed, message, ...pending] }, ...older] };
}

export function newestSeq(thread: Thread | undefined): number {
  const confirmed = thread?.pages[0]?.messages.filter((m) => !m.status) ?? [];
  return confirmed.at(-1)?.seq ?? 0;
}

// A new message arrived: update its conversation's row and move it to the top.
export function applyToConversationList(
  queryClient: QueryClient,
  message: Message,
  myUserId: string,
): "updated" | "unknown" {
  let found = false;
  queryClient.setQueryData<ConversationSummary[]>(["conversations"], (list) => {
    if (!list) return list;
    const row = list.find((c) => c.id === message.conversationId);
    if (!row || message.seq <= row.lastSeq) {
      found = Boolean(row);
      return list;
    }
    found = true;
    // Sending a message means you've read everything before it (the server does the same).
    const lastReadSeq = message.authorId === myUserId ? message.seq : row.lastReadSeq;
    const updated: ConversationSummary = {
      ...row,
      lastMessage: message,
      lastMessageAt: message.createdAt,
      lastSeq: message.seq,
      lastReadSeq,
      unread: message.seq - lastReadSeq,
    };
    return [updated, ...list.filter((c) => c.id !== row.id)];
  });
  return found ? "updated" : "unknown";
}

export function setReadInList(queryClient: QueryClient, conversationId: string, lastReadSeq: number): void {
  queryClient.setQueryData<ConversationSummary[]>(["conversations"], (list) =>
    list?.map((c) =>
      c.id === conversationId && lastReadSeq > c.lastReadSeq
        ? { ...c, lastReadSeq, unread: Math.max(0, c.lastSeq - lastReadSeq) }
        : c,
    ),
  );
}
