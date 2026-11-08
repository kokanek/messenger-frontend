import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount whatever the last test rendered, so every test starts with an empty page.
// (React Testing Library only does this by itself when Vitest's globals are on.)
afterEach(() => {
  cleanup();
  localStorage.clear();
});
