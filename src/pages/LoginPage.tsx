import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Where ProtectedRoute was sending them before it redirected here.
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      // The response carries both tokens; the store saves them in localStorage.
      setSession(await api.login(username, password));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "Wrong username or password" : "Couldn't log in. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="m-auto flex w-full max-w-xs flex-col gap-3 p-4">
      <Logo className="mb-4 size-80 self-center text-gray-500" />
      <h1 className="text-lg font-semibold">Log in</h1>
      <Input aria-label="Username" placeholder="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input aria-label="Password" placeholder="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending || !username || !password}>
        {pending ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
