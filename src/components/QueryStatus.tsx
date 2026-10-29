import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Spinner() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
      <LoaderCircle className="animate-spin" aria-label="Loading" />
    </div>
  );
}

interface RetryProps { onRetry: () => void }

export function Retry({ onRetry }: RetryProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
      <p>Couldn't load this.</p>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}
