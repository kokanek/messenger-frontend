import { describe, expect, it } from "vitest";
import { conversationTitle, listTime } from "@/lib/format";
import { arjun, conversation, priya } from "@/test/fixtures";

describe("conversationTitle", () => {
  it("names a direct conversation after the other person", () => {
    const chat = conversation({ memberIds: [priya.id, arjun.id] });

    const title = conversationTitle(chat, [priya, arjun], priya.id);

    expect(title).toBe("Arjun");
  });

  it("uses a group's own name", () => {
    const chat = conversation({ isGroup: true, name: "Weekend trip" });

    expect(conversationTitle(chat, [priya, arjun], priya.id)).toBe("Weekend trip");
  });
});

describe("listTime", () => {
  // listTime takes "now" as an argument, so the test fixes the clock without fake timers.
  // Dates are built in local time, so the test passes in any timezone.
  it('says "Yesterday" for any time on the previous calendar day', () => {
    const now = new Date(2026, 10, 4, 0, 30); // 4 Nov, 00:30

    expect(listTime(new Date(2026, 10, 3, 23, 59).toISOString(), now)).toBe("Yesterday");
    expect(listTime(new Date(2026, 10, 3, 0, 1).toISOString(), now)).toBe("Yesterday");
  });
});
