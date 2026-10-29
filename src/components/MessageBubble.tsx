import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent, MessageFooter, MessageHeader } from "@/components/ui/message";

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  time: string;
  author?: string;
  status?: "sending" | "failed";
  onRetry?: () => void;
}

export function MessageBubble({ text, isMine, time, author, status, onRetry }: MessageBubbleProps) {
  return (
    <Message align={isMine ? "end" : "start"}>
      <MessageContent className={status === "sending" ? "opacity-60" : undefined}>
        {author && <MessageHeader>{author}</MessageHeader>}
        <Bubble variant={isMine ? "default" : "muted"}>
          <BubbleContent>{text}</BubbleContent>
        </Bubble>
        <MessageFooter>
          {status === "failed" ? (
            <button type="button" onClick={onRetry} className="text-destructive underline">
              Not sent. Tap to retry
            </button>
          ) : status === "sending" ? (
            "Sending..."
          ) : (
            time
          )}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}
