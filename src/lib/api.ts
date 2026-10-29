import { readStoredSession, useAuthStore } from "@/lib/auth-store";
import type { ConversationSummary, LoginResponse, Message, MessagesPage, User } from "@/types";

// In development the Vite proxy sends /api to the backend gateway (see vite.config.ts),
// so requests are same-origin. In production VITE_API_URL points at the API's domain.
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

// The error body every backend error uses: { error: { code, message, ... } }.
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function send(method: string, path: string, body: unknown, accessToken: string | null): Promise<Response> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  // The access token goes on every request, added here by hand.
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return fetch(BASE_URL + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  return new ApiError(res.status, body?.error?.code ?? "UNKNOWN", body?.error?.message ?? `HTTP ${res.status}`);
}

// Every call goes through here. fetch only rejects on a network failure, so a 4xx/5xx is
// turned into an ApiError here, which is what puts React Query into isError.
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res = await send(method, path, body, useAuthStore.getState().accessToken);

  // The access token lasts 15 minutes. When it has expired, get a new pair with the
  // refresh token and try once more.
  if (res.status === 401) {
    const error = await toApiError(res.clone());
    if (error.code === "UNAUTHENTICATED") {
      await refreshTokens();
      res = await send(method, path, body, useAuthStore.getState().accessToken);
    }
  }

  if (!res.ok) throw await toApiError(res);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

let refreshing: Promise<void> | null = null;

// Swaps the refresh token for a new access token and a new refresh token. The old refresh
// token stops working (rotation), so two refreshes must never use the same one:
// - in this tab, concurrent callers share one in-flight refresh;
// - across tabs, the Web Locks API lets one tab refresh at a time, and a tab that waited
//   picks up the tokens the other tab saved instead of refreshing again.
export function refreshTokens(): Promise<void> {
  refreshing ??= (async () => {
    const used = useAuthStore.getState().refreshToken;
    const run = async () => {
      const stored = readStoredSession();
      if (stored.refreshToken && stored.refreshToken !== used) {
        useAuthStore.setState(stored); // another tab already refreshed
        return;
      }
      const res = await send("POST", "/api/auth/refresh", { refreshToken: used }, null);
      if (!res.ok) {
        useAuthStore.getState().clear(); // back to the login page
        throw await toApiError(res);
      }
      useAuthStore.getState().setSession((await res.json()) as LoginResponse);
    };
    await (navigator.locks ? navigator.locks.request("messenger-refresh", run) : run());
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

// One function per endpoint.
export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await send("POST", "/api/auth/login", { username, password }, null);
    if (!res.ok) throw await toApiError(res);
    return res.json();
  },

  logout: () => request<void>("POST", "/api/auth/logout"),

  getUsers: () => request<User[]>("GET", "/api/users"),

  createUser: (input: { username: string; password: string; displayName: string; role: User["role"] }) =>
    request<User>("POST", "/api/users", input),

  getConversations: () => request<ConversationSummary[]>("GET", "/api/conversations"),

  createConversation: (
    input: { type: "direct"; memberIds: string[] } | { type: "group"; name: string; memberIds: string[] },
  ) => request<ConversationSummary>("POST", "/api/conversations", input),

  // No cursor gets the newest page. A cursor (from the previous page's nextCursor) gets
  // the page before it.
  getMessages(conversationId: string, cursor: string | null) {
    const query = cursor ? `?${new URLSearchParams({ cursor })}` : "";
    return request<MessagesPage>("GET", `/api/conversations/${encodeURIComponent(conversationId)}/messages${query}`);
  },

  sendMessage: (conversationId: string, message: { clientMessageId: string; text: string }) =>
    request<Message>("POST", `/api/conversations/${encodeURIComponent(conversationId)}/messages`, message),

  markRead: (conversationId: string, seq: number) =>
    request<{ conversationId: string; lastReadSeq: number }>(
      "POST",
      `/api/conversations/${encodeURIComponent(conversationId)}/read`,
      { seq },
    ),
};
