import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    // Fixed port: fail loudly if it is taken instead of moving to another one.
    // 5173 is left free for the slides.
    port: 5180,
    strictPort: true,
    // Forward API and WebSocket calls to the backend's gateway (code/backend, started with
    // `docker compose up`), so the app and the API share one origin.
    proxy: {
      "/api": "http://localhost:8080",
      "/ws": { target: "ws://localhost:8080", ws: true },
    },
  },
})
