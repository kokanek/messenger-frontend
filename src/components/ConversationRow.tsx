import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/Avatar";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/lib/auth-store";
import { conversationColorKey, conversationTitle, listTime } from "@/lib/format";
import type { ConversationSummary } from "@/types";

interface ConversationRowProps { conversation: ConversationSummary }

export function ConversationRow({ conversation }: ConversationRowProps) {
  const me = useAuthStore((s) => s.user!);
  const { data: users } = useUsers();
  const name = conversationTitle(conversation, users, me.id);
  const { id, lastMessage, lastMessageAt, unread } = conversation;
  const preview = lastMessage
    ? `${lastMessage.authorId === me.id ? "You: " : conversation.isGroup ? `${lastMessage.authorName}: ` : ""}${lastMessage.text}`
    : "No messages yet";

  return (
    <Link to={`/conversations/${id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
      <Avatar name={name || "?"} colorKey={conversationColorKey(conversation, me.id)} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-sm text-muted-foreground">{preview}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">{listTime(lastMessageAt)}</span>
        {unread > 0 && <Badge>{unread}</Badge>}
      </div>
    </Link>
  );
}
