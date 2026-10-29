import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/Avatar";
import { Retry, Spinner } from "@/components/QueryStatus";
import { useUsers } from "@/hooks/useUsers";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

// Pick people, and optionally name a group. One person and no name starts a direct
// conversation (or opens the existing one); anything else is a group. Members can't be
// changed later, so this is the only place to choose them.
export default function NewConversationPage() {
  const me = useAuthStore((s) => s.user!);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: users, isPending, isError, refetch } = useUsers();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const create = useMutation({
    mutationFn: () =>
      selected.length === 1 && groupName.trim() === ""
        ? api.createConversation({ type: "direct", memberIds: selected })
        : api.createConversation({ type: "group", name: groupName.trim(), memberIds: selected }),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate(`/conversations/${conversation.id}`, { replace: true });
    },
  });

  // The whole user list is already here, so searching happens in the browser.
  const query = search.trim().toLowerCase();
  const others = (users ?? []).filter(
    (u) =>
      u.id !== me.id &&
      (u.displayName.toLowerCase().includes(query) || u.username.includes(query)),
  );
  const toggle = (id: string) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const needsName = selected.length > 1 && groupName.trim() === "";

  return (
    <>
      <header className="flex items-center gap-2 border-b px-2 py-2">
        <Link to="/" aria-label="Back to conversations" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft />
        </Link>
        <h1 className="font-medium">New conversation</h1>
      </header>
      <div className="flex flex-col gap-2 border-b p-3">
        <Input aria-label="Search people" placeholder="Search people" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Input
          aria-label="Group name"
          placeholder={selected.length > 1 ? "Group name" : "Group name (leave empty for a direct conversation)"}
          value={groupName}
          maxLength={100}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Button disabled={selected.length === 0 || needsName || create.isPending} onClick={() => create.mutate()}>
          {selected.length > 1 || groupName.trim() ? "Create group" : "Start conversation"}
        </Button>
        {create.isError && <p className="text-sm text-destructive">Couldn't create it. Try again.</p>}
      </div>
      {isPending ? (
        <Spinner />
      ) : isError ? (
        <Retry onRetry={() => refetch()} />
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {others.map((u) => (
            <li key={u.id}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-muted">
                <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
                <Avatar name={u.displayName} colorKey={u.id} />
                <span className="flex-1">{u.displayName}</span>
                <span className="text-xs text-muted-foreground">@{u.username}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
