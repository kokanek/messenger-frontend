// The API's data shapes. They mirror code/backend/packages/shared/src/types.ts
// (backend spec, section 7.2). Dates are ISO 8601 strings in UTC.

export type Role = "admin" | "member";

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string; // short-lived: send as Authorization: Bearer <accessToken>
  expiresIn: number; // seconds
  refreshToken: string; // long-lived: send to POST /api/auth/refresh for a new pair
  user: User;
}

export interface Message {
  id: string;
  conversationId: string;
  seq: number; // 1, 2, 3... within the conversation, no gaps
  authorId: string;
  authorName: string;
  clientMessageId: string; // made by the sender, so a retried send isn't stored twice
  text: string;
  createdAt: string;
}

// A message as the thread shows it: either saved by the server, or still on its way
// (an optimistic copy made by this device before the server confirmed it).
export interface ThreadMessage extends Message {
  status?: "sending" | "failed";
}

// One page of a thread, oldest message first. nextCursor is what to pass to get the
// page before this one, or null when there is nothing older.
export interface MessagesPage {
  messages: ThreadMessage[];
  nextCursor: string | null;
}

// One row of the conversation list.
export interface ConversationSummary {
  id: string;
  type: "direct" | "group";
  isGroup: boolean;
  name: string | null; // group name; null for direct (show the other member's name)
  memberIds: string[];
  lastSeq: number;
  lastReadSeq: number;
  unread: number;
  lastMessage: Message | null;
  lastMessageAt: string;
}

// Every WebSocket frame has this envelope.
export interface ServerEvent {
  type: string;
  payload: unknown;
}
