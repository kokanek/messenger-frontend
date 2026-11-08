import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Composer } from "@/components/Composer";
import { useAuthStore } from "@/lib/auth-store";
import { arjun, conversation, priya } from "@/test/fixtures";

// Replace only the hook that talks to the server, so the test can see what was sent.
const send = vi.fn();
vi.mock("@/hooks/useSendMessage", () => ({ useSendMessage: () => ({ send, retry: vi.fn() }) }));

function renderComposer() {
  // A fresh QueryClient per test, already holding the data Composer reads, so nothing is
  // fetched. (TanStack Query's testing guide: one client per test keeps tests isolated.)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(["users"], [priya, arjun]);
  queryClient.setQueryData(["conversations"], [conversation({ id: "c-1" })]);
  render(
    <QueryClientProvider client={queryClient}>
      <Composer conversationId="c-1" />
    </QueryClientProvider>,
  );
}

describe("Composer", () => {
  beforeEach(() => {
    send.mockClear();
    useAuthStore.setState({ user: priya });
  });

  it("keeps Send disabled while the draft is empty or only spaces", async () => {
    const user = userEvent.setup();
    renderComposer();
    const sendButton = screen.getByRole("button", { name: "Send" });

    expect(sendButton).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Message" }), "   ");
    expect(sendButton).toBeDisabled();
  });

  it("shows the other person's name in the empty box", () => {
    renderComposer();

    expect(screen.getByPlaceholderText("Message Arjun")).toBeInTheDocument();
  });

  it("sends the draft on Enter and clears the box", async () => {
    const user = userEvent.setup();
    renderComposer();
    const box = screen.getByRole("textbox", { name: "Message" });

    await user.type(box, "See you at 6{Enter}");

    expect(send).toHaveBeenCalledWith("See you at 6");
    expect(box).toHaveValue("");
  });
});
