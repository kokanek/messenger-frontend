import { Outlet } from "react-router";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useSocket } from "@/hooks/useSocket";

// The layout around every signed-in screen. It also owns the one WebSocket, so the
// connection stays open while you move between pages.
export function AppShell() {
  useSocket();
  return (
    <>
      <OfflineBanner />
      <Outlet />
    </>
  );
}
