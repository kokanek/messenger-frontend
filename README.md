# Messenger frontend

The web app for Messenger, a chat app: sign in, see your conversations, start a direct or
group chat, and send and receive messages live. It is a React single-page app written in
TypeScript and built with Vite.

It needs the Messenger backend to run: https://github.com/kokanek/messenger-backend. The app
talks to it over HTTP (`/api/*`) and one WebSocket (`/ws`).

## Tech stack

| Area | Library |
| --- | --- |
| UI | React 19, TypeScript |
| Build and dev server | Vite 8 |
| Routing | React Router 8 |
| Server data (fetching, caching) | TanStack Query 5 |
| Signed-in session | Zustand 5 |
| Styling and components | Tailwind CSS 4, shadcn/ui components on Base UI, lucide icons |
| Feature flags | Flagsmith |
| Tests | Vitest 5, React Testing Library, jsdom |
| Lint and git hooks | ESLint 10, Husky 9 |

Exact versions are in `package.json`.

## Run it locally

1. Start the backend first (see its README). Its gateway listens on `http://localhost:8080`.
2. Then, in this repository:

```bash
npm install
npm run dev        # http://localhost:5180
```

The dev server forwards `/api` and `/ws` to `localhost:8080` (`vite.config.ts`), so the app
and the API share one origin and no extra setup is needed. The port is fixed at 5180
(`strictPort`): if it is taken, Vite stops instead of picking another port. 5180 is the origin
the backend's `.env.example` allows.

A fresh backend has one user, the admin (`ADMIN_USERNAME` and `ADMIN_PASSWORD` in the
backend's `.env`). Sign in as the admin and add everyone else from Settings.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 5180 |
| `npm run build` | Type-check (`tsc -b`), then a production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only, no build |
| `npm test` | Run the tests once (Vitest) |
| `npm run test:watch` | Run the tests on every save |

## Folder structure

```
src/
├── main.tsx            entry point: the React Query client and the Flagsmith provider
├── App.tsx             every route
├── pages/              one component per route
├── components/         the app's own components, each test next to its component
│   └── ui/             shadcn/ui building blocks (button, input, avatar, bubble...)
├── hooks/              data hooks (useConversations, useMessages, useSendMessage,
│                       useMarkRead, useUsers) and useSocket, the WebSocket
├── lib/
│   ├── api.ts          the only place that calls fetch: one function per endpoint
│   ├── auth-store.ts   who is signed in, and their tokens (Zustand + localStorage)
│   ├── cache.ts        functions that write messages into the React Query cache
│   └── format.ts       display helpers: conversation titles, member names, times
├── test/               test setup and shared test data
└── types.ts            the shapes the API returns
public/                 static files served as they are (favicon)
```

Config files at the root:

| File | Purpose |
| --- | --- |
| `vite.config.ts` | Plugins (React, Tailwind), the `@` alias for `src/`, the dev port and the proxy to the backend |
| `vitest.config.ts` | Reuses `vite.config.ts`, adds jsdom and the test setup file |
| `eslint.config.js` | Lint rules, including the React hooks rules |
| `components.json` | shadcn/ui settings, used when adding a new UI component |
| `vercel.json` | Sends every path to `index.html`, so a page reload on any route works |
| `.husky/pre-commit` | Runs lint, typecheck and the tests before every commit |

## Routes

| Path | Page |
| --- | --- |
| `/login` | `LoginPage` |
| `/` | `ConversationListPage` |
| `/new` | `NewConversationPage` |
| `/conversations/:conversationId` | `ConversationPage` |
| `/settings` | `Settings` (admins also see a form to add users) |

Every route except `/login` sits inside `ProtectedRoute`, which sends a signed-out user to
`/login`, and `AppShell`, the layout around each page.

## How data moves

- **Requests:** every call goes through `src/lib/api.ts`. It adds the access token to each
  request. When the token has expired (a 401), it gets a new pair with the refresh token and
  tries once more.
- **Server data:** pages read through the hooks in `src/hooks/`, which use TanStack Query, so
  responses are cached and shared between pages.
- **Live messages:** `useSocket` keeps one WebSocket open while someone is signed in. It only
  receives. A new message is written straight into the React Query cache (`src/lib/cache.ts`),
  so the open conversation and the list update without a refetch. Sending a message is an
  HTTP `POST`. If the socket drops, it reconnects with exponential backoff, and refetches once
  it is back so nothing sent in between is missed.

## Environment variables

All are optional for local development.

| Variable | Used for | When it is not set |
| --- | --- | --- |
| `VITE_API_URL` | The backend's public URL, for example `https://api.example.com` | Requests go to the same origin, which the dev proxy forwards |
| `VITE_WS_URL` | The WebSocket URL, for example `wss://api.example.com/ws` | `ws://` or `wss://` on the page's own host, path `/ws` |
| `VITE_FLAGSMITH_ENVIRONMENT_ID` | The Flagsmith environment key for feature flags | No request to Flagsmith; every flag reads as off |

Vite builds these into the JavaScript bundle at build time, so they must never hold a secret.

Feature flag in use: `conversation_search` shows a search box on the conversation list.

## Tests

```bash
npm test
```

Unit tests cover the pure functions in `src/lib/` (`cache.ts`, `format.ts`). Component tests
cover `MessageBubble`, `Composer` and `ProtectedRoute`, using React Testing Library to find
elements by role and label, the way a user would. Test files sit next to the file they test
and end in `.test.ts` or `.test.tsx`.

The end-to-end test, which drives this app in a real browser against the whole backend, lives
in the backend repository (`test/e2e/`).

## Deploy

The app is hosted on Vercel, which builds and deploys every push to `main` through its Git
integration. In the Vercel project,
set `VITE_API_URL` and `VITE_WS_URL` to the backend's domain, and optionally
`VITE_FLAGSMITH_ENVIRONMENT_ID`. The backend only accepts requests and WebSocket connections
from the origins in its `ALLOWED_ORIGINS`, so add the Vercel domain there too.
