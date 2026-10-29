import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function Settings() {
  const user = useAuthStore((s) => s.user!);
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function logOut() {
    // Revokes this device's refresh token on the server. Even if that call fails, forget
    // the tokens here: without them this browser is logged out.
    await api.logout().catch(() => {});
    clear();
    queryClient.clear(); // the next person to log in mustn't see this person's data
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="flex items-center gap-2 border-b px-2 py-2">
        <Link to="/" aria-label="Back to conversations" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft />
        </Link>
        <h1 className="font-medium">Settings</h1>
      </header>
      <div className="flex flex-col items-center gap-3 p-6">
        <p className="text-sm">
          Signed in as <strong>{user.displayName}</strong>
        </p>
        <Avatar name={user.displayName} colorKey={user.id} size="xl" />
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        <Button variant="outline" onClick={logOut}>Log out</Button>
      </div>
      {/* The server checks the role too; hiding the form only keeps the screen tidy. */}
      {user.role === "admin" && <CreateUserForm />}
    </>
  );
}

function CreateUserForm() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");

  const create = useMutation({
    mutationFn: () => api.createUser({ username, displayName, password, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setUsername("");
      setDisplayName("");
      setPassword("");
      setRole("member");
    },
  });

  const error =
    create.error instanceof ApiError && create.error.code === "USERNAME_TAKEN"
      ? "That username is taken"
      : create.error
        ? "Check the fields: username 3 to 32 of a-z, 0-9, _; password at least 8 characters"
        : null;

  return (
    <form
      className="flex flex-col gap-2 border-t p-4"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate();
      }}
    >
      <h2 className="font-medium">Create a user</h2>
      <Input aria-label="Username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input aria-label="Display name" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <Input aria-label="Password" placeholder="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={role === "admin"} onChange={(e) => setRole(e.target.checked ? "admin" : "member")} />
        Admin
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {create.isSuccess && <p className="text-sm text-muted-foreground">Created {create.data.displayName}.</p>}
      <Button type="submit" disabled={create.isPending || !username || !displayName || !password}>
        Create user
      </Button>
    </form>
  );
}
