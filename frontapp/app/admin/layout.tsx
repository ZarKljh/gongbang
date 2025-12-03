// app/admin/layout.tsx
import type { ReactNode } from 'react'
import AdminNav from '@/app/components/AdminNav'

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#f3f4f6', // 연한 회색 배경
            }}
        >
            <AdminNav />

            <main
                style={{
                    margin: '1.5rem auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                }}
            >
                {children}
            </main>
        </div>
    )
}
