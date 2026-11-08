import type { InfiniteData } from "@tanstack/react-query";
import type { ConversationSummary, MessagesPage, ThreadMessage, User } from "@/types";

// Small builders for test data: each test spells out only the fields it cares about.

export const priya: User = { id: "u-priya", username: "priya", displayName: "Priya", role: "member" };
export const arjun: User = { id: "u-arjun", username: "arjun", displayName: "Arjun", role: "member" };

export function message(overrides: Partial<ThreadMessage> = {}): ThreadMessage {
  const seq = overrides.seq ?? 1;
  return {
    id: `m-${seq}`,
    conversationId: "c-1",
    seq,
    authorId: arjun.id,
    authorName: arjun.displayName,
    clientMessageId: `client-${seq}`,
    text: `message ${seq}`,
    createdAt: "2026-11-04T10:00:00.000Z",
    ...overrides,
  };
}

// pages[0] is the newest page; inside a page, messages are oldest first.
export function thread(...pages: ThreadMessage[][]): InfiniteData<MessagesPage, string | null> {
  return {
    pages: pages.map((messages, i) => ({ messages, nextCursor: i < pages.length - 1 ? `cursor-${i}` : null })),
    pageParams: pages.map((_, i) => (i === 0 ? null : `cursor-${i - 1}`)),
  };
}

export function conversation(overrides: Partial<ConversationSummary> = {}): ConversationSummary {
  return {
    id: "c-1",
    type: "direct",
    isGroup: false,
    name: null,
    memberIds: [priya.id, arjun.id],
    lastSeq: 0,
    lastReadSeq: 0,
    unread: 0,
    lastMessage: null,
    lastMessageAt: "2026-11-04T09:00:00.000Z",
    ...overrides,
  };
}

// Freezes an object and everything inside it, so a helper that mutates its input throws
// a TypeError in the test instead of quietly corrupting the cache.
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
