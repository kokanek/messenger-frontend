import { create } from "zustand";
import type { LoginResponse, User } from "@/types";

// Who is signed in, and the two tokens that prove it. Kept in localStorage, so they
// survive a page reload and you can see them yourself: DevTools > Application >
// Local Storage. The trade-off: any script running on this page could read them too.
const ACCESS_TOKEN = "messenger.accessToken";
const REFRESH_TOKEN = "messenger.refreshToken";
const USER = "messenger.user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: LoginResponse) => void;
  clear: () => void;
}

function readUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER) ?? "null");
  } catch {
    return null; // not valid JSON: treat as logged out
  }
}

export function readStoredSession() {
  return {
    user: readUser(),
    accessToken: localStorage.getItem(ACCESS_TOKEN),
    refreshToken: localStorage.getItem(REFRESH_TOKEN),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readStoredSession(),

  setSession: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
    localStorage.setItem(USER, JSON.stringify(user));
    set({ accessToken, refreshToken, user });
  },

  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER);
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

// Another tab logged in, logged out or refreshed the tokens: pick up what it stored.
// (The "storage" event only fires in the other tabs, never in the tab that wrote.)
window.addEventListener("storage", (event) => {
  if (event.key === null || [ACCESS_TOKEN, REFRESH_TOKEN, USER].includes(event.key)) {
    useAuthStore.setState(readStoredSession());
  }
});
