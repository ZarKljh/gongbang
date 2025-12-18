// app/admin/layout.tsx
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminNav from '@/app/components/AdminNav'
import { api } from '@/app/utils/api'

type MeResponse = {
    resultCode: string
    msg: string
    data?: {
        id: number
        nickName: string
        role?: string // 단일 role 필드
    }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const cookieStore = cookies()
    const cookieHeader = cookieStore.toString()

    // 쿠키가 없으면 로그인으로
    if (!cookieHeader) {
        redirect('/auth/login?redirect=/admin/admin_account')
    }

    // api.ts의 baseURL을 그대로 재사용 (예: http://localhost:8090/api/v1)
    const API_BASE_URL = api.defaults.baseURL ?? ''
    const meUrl = `${API_BASE_URL}/auth/me`

    let isAdmin = false

    try {
        const res = await fetch(meUrl, {
            method: 'GET',
            headers: {
                cookie: cookieHeader,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            console.error('auth/me 응답 에러 status:', res.status)
        } else {
            const body = (await res.json()) as MeResponse

            if (body?.resultCode === '200' && body?.data) {
                const role = body.data.role ?? ''
                isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'
            }
        }
    } catch (e) {
        console.error('ADMIN 권한 확인 실패:', e)
    }

    // 관리자 아니면 로그인으로
    if (!isAdmin) {
        redirect('/auth/login?redirect=/admin/admin_account')
    }

    // 통과 시 렌더
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#f3f4f6',
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
