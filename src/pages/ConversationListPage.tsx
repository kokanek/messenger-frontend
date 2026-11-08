import { useState } from "react";
import { Link } from "react-router";
import { useFlags } from "@flagsmith/flagsmith/react";
import { AppHeader } from "@/components/AppHeader";
import { ConversationRow } from "@/components/ConversationRow";
import { Retry, Spinner } from "@/components/QueryStatus";
import { Input } from "@/components/ui/input";
import { useConversations } from "@/hooks/useConversations";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/lib/auth-store";
import { conversationTitle } from "@/lib/format";

export default function ConversationListPage() {
  const { data, isPending, isError, refetch } = useConversations();
  const me = useAuthStore((s) => s.user!);
  const { data: users } = useUsers();
  // The search box is behind the conversation_search flag in Flagsmith: switched on and off
  // from its dashboard, with no deploy.
  const flags = useFlags(["conversation_search"]);
  const [query, setQuery] = useState("");
  const shown = data?.filter((c) =>
    conversationTitle(c, users, me.id).toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <AppHeader />
      {flags.conversation_search.enabled && (
        <div className="border-b px-4 py-2">
          <Input
            aria-label="Search conversations"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      {isPending ? (
        <Spinner />
      ) : isError ? (
        <Retry onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <p className="p-4 text-center text-sm text-muted-foreground">
          No conversations yet. <Link to="/new" className="underline">Start one</Link>.
        </p>
      ) : shown!.length === 0 ? (
        <p className="p-4 text-center text-sm text-muted-foreground">No conversation matches "{query.trim()}".</p>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {shown!.map((c) => (
            <li key={c.id}>
              <ConversationRow conversation={c} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
