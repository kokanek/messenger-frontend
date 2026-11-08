import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import flagsmith from '@flagsmith/flagsmith'
import { FlagsmithProvider } from '@flagsmith/flagsmith/react'
import './index.css'
import App from './App.tsx'
import { ApiError } from '@/lib/api'

// One cache for the whole app, created once outside any component.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx means the request itself is wrong (not a member, no such conversation), so
      // asking again gets the same answer. Network errors and 5xx keep the default 3 retries.
      retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 3,
    },
  },
})

// Feature flags are fetched from Flagsmith once, when the app loads. Without a key (local dev,
// CI) the fetch never happens and every flag reads as off.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlagsmithProvider
      flagsmith={flagsmith}
      options={{ environmentID: import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </FlagsmithProvider>
  </StrictMode>,
)
