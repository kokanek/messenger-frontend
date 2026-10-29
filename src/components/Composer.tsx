import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversation } from "@/hooks/useConversations";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/lib/auth-store";
import { conversationTitle } from "@/lib/format";

interface ComposerProps { conversationId: string }

// Holds the draft. Submitting adds the message to the thread at once (as pending) and
// clears the draft; useSendMessage does the rest.
export function Composer({ conversationId }: ComposerProps) {
  const me = useAuthStore((s) => s.user!);
  const { data: users } = useUsers();
  const conversation = useConversation(conversationId).data;
  const name = conversation ? conversationTitle(conversation, users, me.id) : "";
  const { send } = useSendMessage(conversationId);
  const [draft, setDraft] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (draft.trim() === "") return;
    send(draft);
    setDraft("");
  }

  return (
    <form className="flex gap-2 border-t p-3" onSubmit={onSubmit}>
      <Input
        aria-label="Message"
        placeholder={name ? `Message ${name}` : "Message"}
        value={draft}
        maxLength={4000}
        onChange={(e) => setDraft(e.target.value)}
      />
      <Button type="submit" size="icon" aria-label="Send" disabled={draft.trim() === ""}>
        <SendHorizontal />
      </Button>
    </form>
  );
}
