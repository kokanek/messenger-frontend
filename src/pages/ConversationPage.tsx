import { useParams } from "react-router";
import { ConversationHeader } from "@/components/ConversationHeader";
import { MessageList } from "@/components/MessageList";
import { Composer } from "@/components/Composer";
import { useMarkRead } from "@/hooks/useMarkRead";

export default function ConversationPage() {
  const { conversationId } = useParams();
  if (!conversationId) return null;
  // key: a fresh component tree per conversation, so no state leaks from the last one.
  return <Conversation key={conversationId} conversationId={conversationId} />;
}

function Conversation({ conversationId }: { conversationId: string }) {
  useMarkRead(conversationId);
  return (
    <>
      <ConversationHeader conversationId={conversationId} />
      <MessageList conversationId={conversationId} />
      <Composer conversationId={conversationId} />
    </>
  );
}
