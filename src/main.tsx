import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
