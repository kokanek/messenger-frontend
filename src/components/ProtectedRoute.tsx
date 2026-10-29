import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/lib/auth-store";

// No user, no render: redirect to the login page before a private screen ever mounts,
// remembering where they were headed.
export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
