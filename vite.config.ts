import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Makes the app installable: writes manifest.webmanifest and a service worker (sw.js)
    // at build time, and registers the worker. https://vite-pwa-org.netlify.app/guide/
    VitePWA({
      registerType: "autoUpdate",
      // Also serve the manifest and service worker from `npm run dev`, not only from a build.
      devOptions: { enabled: true },
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Messenger",
        short_name: "Messenger",
        description: "Chat in real time with the people you know.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // API and WebSocket paths go to the backend, never to the cached index.html.
        navigateFallbackDenylist: [/^\/api/, /^\/ws/],
      },
    }),
  ],
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
