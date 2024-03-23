'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PropsWithChildren, Suspense, lazy, useEffect, useState } from 'react'

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/production').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
)

export default function ReactQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  const [showDevtools, setShowDevtools] = useState(false)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error
      window.toggleDevtools = () => setShowDevtools((old) => !old)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools initialIsOpen />
      {showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}
