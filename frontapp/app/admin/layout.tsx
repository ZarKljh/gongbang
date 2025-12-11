// app/admin/layout.tsx
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminNav from '@/app/components/AdminNav'

type MeResponse = {
    resultCode: string
    msg: string
    data?: {
        id: number
        nickName: string
        role?: string // 🔹 여기! 단일 role 필드
    }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const cookieStore = cookies()

    // 현재 요청의 쿠키를 하나의 헤더 문자열로 가져옴
    const cookieHeader = cookieStore.toString()

    // 쿠키가 아예 없으면 -> 로그인으로 보냄
    if (!cookieHeader) {
        redirect('/auth/login?redirect=/admin/admin_account')
    }

    let isAdmin = false

    try {
        // 🔹 백엔드의 /auth/me 로 로그인 & 권한 확인
        const res = await fetch('http://localhost:8090/api/v1/auth/me', {
            method: 'GET',
            headers: {
                cookie: cookieHeader, // 현재 요청의 쿠키를 그대로 백엔드에 전달
            },
            cache: 'no-store',
        })

        if (res.ok) {
            const body = (await res.json()) as MeResponse

            if (body.resultCode === '200' && body.data) {
                const role = body.data.role ?? ''
                // 🔥 여기에서 단일 role 값으로 판단
                isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'
            }
        } else {
            console.error('auth/me 응답 에러 status:', res.status)
        }
    } catch (e) {
        console.error('ADMIN 권한 확인 실패:', e)
    }

    // 🔒 관리자 권한 아니면 바로 로그인 페이지로 튕기기
    if (!isAdmin) {
        redirect('/auth/login?redirect=/admin/admin_account')
    }

    // 🔓 여기까지 통과한 사람만 admin 화면 렌더링
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
