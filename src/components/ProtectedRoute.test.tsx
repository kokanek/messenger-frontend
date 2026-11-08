import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/lib/auth-store";
import { priya } from "@/test/fixtures";

// MemoryRouter keeps the URL in memory, so a test can start on any page.
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/conversations" element={<p>Your conversations</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("sends a signed-out visitor to the login page", () => {
    useAuthStore.setState({ user: null });
    renderAt("/conversations");
    expect(screen.getByText("Login page")).toBeTruthy();
    expect(screen.queryByText("Your conversations")).toBeNull();
  });

  it("lets a signed-in user through", () => {
    useAuthStore.setState({ user: priya });
    renderAt("/conversations");
    expect(screen.getByText("Your conversations")).toBeTruthy();
  });
});
