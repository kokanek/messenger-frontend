import { Link } from "react-router";
import { AppHeader } from "@/components/AppHeader";
import { ConversationRow } from "@/components/ConversationRow";
import { Retry, Spinner } from "@/components/QueryStatus";
import { useConversations } from "@/hooks/useConversations";

export default function ConversationListPage() {
  const { data, isPending, isError, refetch } = useConversations();

  return (
    <>
      <AppHeader />
      {isPending ? (
        <Spinner />
      ) : isError ? (
        <Retry onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <p className="p-4 text-center text-sm text-muted-foreground">
          No conversations yet. <Link to="/new" className="underline">Start one</Link>.
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {data.map((c) => (
            <li key={c.id}>
              <ConversationRow conversation={c} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
