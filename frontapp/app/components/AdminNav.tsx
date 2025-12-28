'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/app/utils/api'

export default function AdminNav() {
    const router = useRouter()

    // api.ts에서 baseURL만 바꾸면 전부 따라가게 만드는 팀 규칙
    const API_BASE_URL = api.defaults.baseURL

    const handleLogout = useCallback(async () => {
        const ok = window.confirm('로그아웃 하시겠어요?')
        if (!ok) return

        try {
            // 쿠키/세션 기반 로그아웃이면 credentials 필요
            await api.post(`${API_BASE_URL}/auth/logout`, null, { withCredentials: true })
        } catch (e) {
            console.error('로그아웃 요청 실패:', e)
            // 실패해도 프론트 정리/이동은 진행
        } finally {
            // 로컬스토리지 토큰을 쓴 적 있으면 정리
            try {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
            } catch {
                // ignore
            }

            router.push('/auth/login/user')
        }
    }, [API_BASE_URL, router])

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: '0.75rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                }}
            >
                {/* 왼쪽 로고/타이틀 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Admin Panel</span>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>관리자 페이지</span>
                </div>

                {/* 가운데 메뉴 (필요하면 채워 쓰기) */}
                <nav
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        flex: 1,
                        justifyContent: 'center',
                    }}
                />

                {/* 오른쪽 프로필/로그아웃 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.85rem',
                    }}
                >
                    <span style={{ color: '#6b7280' }}>admin@example.com</span>
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            borderRadius: 999,
                            border: '1px solid #e5e7eb',
                            padding: '0.35rem 0.9rem',
                            background: '#f9fafb',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                        }}
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </header>
    )
}
