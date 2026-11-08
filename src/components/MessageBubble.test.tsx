import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageBubble } from "@/components/MessageBubble";

// Find things the way a user does: by visible text and by role, not by class names.

describe("MessageBubble", () => {
  it('shows "Sending..." instead of the time while the message is on its way', () => {
    render(<MessageBubble text="Hi" isMine time="10:41" status="sending" />);

    expect(screen.getByText("Sending...")).toBeTruthy();
    expect(screen.queryByText("10:41")).toBeNull();
  });

  it("offers a retry when the send failed, and calls onRetry when tapped", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<MessageBubble text="Hi" isMine time="10:41" status="failed" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Not sent. Tap to retry" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
