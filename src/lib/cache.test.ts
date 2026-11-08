import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { addIfMissing, addToNewestPage, applyToConversationList } from "@/lib/cache";
import { conversation, deepFreeze, message, priya, thread } from "@/test/fixtures";
import type { ConversationSummary } from "@/types";

// The cache helpers are pure functions: data in, new data out. No React, no network.

describe("addToNewestPage", () => {
  it("appends to the newest page, keeps older pages, and never mutates the cache", () => {
    const older = [message({ seq: 1 })];
    const newest = [message({ seq: 2 })];
    const before = deepFreeze(thread(newest, older)); // mutating a frozen object throws
    const pending = message({ seq: 0, clientMessageId: "draft-1", status: "sending" });

    const after = addToNewestPage(before, pending)!;

    expect(after.pages[0]!.messages.map((m) => m.clientMessageId)).toEqual(["client-2", "draft-1"]);
    expect(after.pages[1]).toBe(before.pages[1]); // untouched pages are reused as-is
    expect(after).not.toBe(before);
  });
});

describe("addIfMissing", () => {
  it("doesn't duplicate our own message when the socket echoes it", () => {
    const pending = message({ seq: 0, clientMessageId: "draft-1", status: "sending" });
    const before = deepFreeze(thread([message({ seq: 1 }), pending]));
    const echo = message({ seq: 2, clientMessageId: "draft-1" });

    const after = addIfMissing(before, echo)!;

    expect(after.pages[0]!.messages).toHaveLength(2);
    expect(after.pages[0]!.messages[1]).toEqual(echo); // no status: confirmed
  });

  it("puts someone else's new message after the confirmed ones and before our pending ones", () => {
    const pending = message({ seq: 0, clientMessageId: "draft-1", status: "sending" });
    const before = deepFreeze(thread([message({ seq: 1 }), pending]));

    const after = addIfMissing(before, message({ seq: 2 }))!;

    expect(after.pages[0]!.messages.map((m) => m.clientMessageId)).toEqual(["client-1", "client-2", "draft-1"]);
  });
});

describe("applyToConversationList", () => {
  // A real QueryClient, no mocks: the helper reads and writes ["conversations"] in it.
  function listWith(...rows: ConversationSummary[]) {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["conversations"], rows);
    return queryClient;
  }

  it("moves the conversation to the top and counts the new message as unread", () => {
    const queryClient = listWith(conversation({ id: "c-0" }), conversation({ id: "c-1", lastSeq: 3, lastReadSeq: 3 }));

    const result = applyToConversationList(queryClient, message({ conversationId: "c-1", seq: 4 }), priya.id);

    const [top, second] = queryClient.getQueryData<ConversationSummary[]>(["conversations"])!;
    expect(result).toBe("updated");
    expect(top).toMatchObject({ id: "c-1", lastSeq: 4, unread: 1 });
    expect(second!.id).toBe("c-0");
  });
});
