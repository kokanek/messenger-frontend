import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// Shown while the browser reports no network. Messages sent meanwhile fail and can be
// retried; the socket reconnects and catches up by itself once the network is back.
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine);
  if (online) return null;
  return <p className="bg-muted px-4 py-1 text-center text-xs text-muted-foreground">You're offline</p>;
}
