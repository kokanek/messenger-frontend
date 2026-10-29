import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { Retry, Spinner } from "@/components/QueryStatus";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { messageTime } from "@/lib/format";
import { useConversation } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";

interface MessageListProps { conversationId: string }

export function MessageList({ conversationId }: MessageListProps) {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isPending, isError, refetch } =
    useMessages(conversationId);
  const isGroup = useConversation(conversationId).data?.isGroup ?? false;
  const me = useAuthStore((s) => s.user!);
  const { retry } = useSendMessage(conversationId);
  const topRef = useRef<HTMLDivElement>(null);

  function onReachTop() {
    if (hasNextPage && !isFetching) fetchNextPage();
  }

  // Watch the empty div above the oldest message. No dependency array: the
  // observer is rebuilt after every render, so it always calls the latest
  // onReachTop, and re-checks the div once a new page has rendered.
  useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onReachTop();
    });
    observer.observe(top);
    return () => observer.disconnect();
  });

  if (isPending) return <Spinner />;
  if (isError) {
    // A 4xx won't change on a retry, so show the backend's reason instead of a button.
    if (error instanceof ApiError && error.status < 500) {
      return <p className="flex-1 p-4 text-center text-sm text-muted-foreground">{error.message}</p>;
    }
    return <Retry onRetry={() => refetch()} />;
  }

  // pages[0] is the newest page. Show the oldest page first.
  const messages = [...data.pages].reverse().flatMap((page) => page.messages);

  if (messages.length === 0) {
    return <p className="flex-1 p-4 text-center text-sm text-muted-foreground">No messages yet</p>;
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* An overlay, not part of the list, so it never shifts the messages. */}
      {isFetchingNextPage && (
        <LoaderCircle
          className="absolute top-3 left-1/2 z-10 size-5 -translate-x-1/2 animate-spin text-muted-foreground"
          aria-label="Loading older messages"
        />
      )}
      {/* column-reverse starts the scroll at the bottom, so the thread opens
          on the newest message, and older pages added above don't move the view. */}
      <div className="flex flex-1 flex-col-reverse overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Empty div above the oldest message: the observer watches it. */}
          <div ref={topRef} />
          {messages.map((m) => {
            const isMine = m.authorId === me.id;
            return (
              <MessageBubble
                // clientMessageId, not id: it stays the same when the pending copy is swapped
                // for the saved one, so React keeps the same element.
                key={m.clientMessageId}
                text={m.text}
                time={messageTime(m.createdAt)}
                isMine={isMine}
                // In a group, name who sent each message (except your own).
                author={isGroup && !isMine ? m.authorName : undefined}
                status={m.status}
                onRetry={() => retry(m)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
