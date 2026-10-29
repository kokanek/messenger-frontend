import type { ConversationSummary, User } from "@/types";

// A group's name, or for a direct conversation, the other member's display name.
// The API sends name: null for direct conversations, because the right name depends on
// who is looking.
export function conversationTitle(conversation: ConversationSummary, users: User[] | undefined, myId: string): string {
  if (conversation.name) return conversation.name;
  const otherId = conversation.memberIds.find((id) => id !== myId);
  return users?.find((u) => u.id === otherId)?.displayName ?? "";
}

// What a conversation's avatar color is keyed on: the other member's id for a direct
// conversation (so it matches that person everywhere), the conversation's own id for a group.
export function conversationColorKey(conversation: ConversationSummary, myId: string): string {
  if (conversation.isGroup) return conversation.id;
  return conversation.memberIds.find((id) => id !== myId) ?? conversation.id;
}

export function memberNames(conversation: ConversationSummary, users: User[] | undefined, myId: string): string {
  return conversation.memberIds
    .map((id) => (id === myId ? "You" : users?.find((u) => u.id === id)?.displayName))
    .filter(Boolean)
    .join(", ");
}

const timeOfDay = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const date = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

// "10:41" today, "Yesterday", "Mon" within the week, otherwise "12 Oct".
export function listTime(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((startOfToday.getTime() - then.getTime()) / 86_400_000) + 1;
  if (then >= startOfToday) return timeOfDay.format(then);
  if (days <= 1) return "Yesterday";
  if (days < 7) return weekday.format(then);
  return date.format(then);
}

export const messageTime = (iso: string) => timeOfDay.format(new Date(iso));
