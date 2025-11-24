'use client'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// 🔥 전역으로 export되는 queryClient (v5에서 가장 안정적인 방식)
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // 네가 사용하던 옵션 유지
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1,
            staleTime: 0, // 필요 시 설정 가능
        },
    },
})

export default function ReactQueryProviders({ children }: React.PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
