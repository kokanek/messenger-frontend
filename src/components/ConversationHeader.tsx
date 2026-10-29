import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar";
import { useConversation } from "@/hooks/useConversations";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/lib/auth-store";
import { conversationColorKey, conversationTitle, memberNames } from "@/lib/format";

interface ConversationHeaderProps { conversationId: string }

export function ConversationHeader({ conversationId }: ConversationHeaderProps) {
  const me = useAuthStore((s) => s.user!);
  const { data: users } = useUsers();
  const { data: conversation, isPending } = useConversation(conversationId);
  const name = conversation ? conversationTitle(conversation, users, me.id) : "";
  return (
    <header className="flex items-center gap-2 border-b px-2 py-2">
      <Link to="/" aria-label="Back to conversations" className={buttonVariants({ variant: "ghost", size: "icon" })}>
        <ChevronLeft />
      </Link>
      {conversation && <Avatar name={name || "?"} colorKey={conversationColorKey(conversation, me.id)} />}
      <div className="min-w-0">
        <p className="truncate font-medium">{conversation ? name : isPending ? "" : "Conversation not found"}</p>
        {conversation?.isGroup && (
          <p className="truncate text-xs text-muted-foreground">{memberNames(conversation, users, me.id)}</p>
        )}
      </div>
    </header>
  );
}
