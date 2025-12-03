'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/app/utils/api'
import { useCallback } from 'react'

export default function AdminNav() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = useCallback(async () => {
        const ok = window.confirm('로그아웃 하시겠어요?')
        if (!ok) return

        try {
            // 백엔드 세션/쿠키 로그아웃 (엔드포인트는 프로젝트에 맞게 조정)
            await api.post('/auth/logout')
        } catch (e) {
            console.error('로그아웃 요청 실패:', e)
            // 굳이 막진 말고, 토큰/화면 정리는 계속 진행
        } finally {
            // 혹시 로컬스토리지에 토큰 저장했다면 같이 제거
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                } catch {
                    // 무시
                }
            }

            // 로그인 페이지로 이동 (관리자도 여기서 로그인했다면 동일 경로 사용)
            router.push('/auth/login/user')
        }
    }, [router])

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
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: '1.1rem',
                        }}
                    >
                        Admin Panel
                    </span>
                    <span
                        style={{
                            fontSize: '0.8rem',
                            color: '#9ca3af',
                        }}
                    >
                        관리자 페이지
                    </span>
                </div>

                {/* 가운데 메뉴 (필요하면 채워 쓰기) */}
                <nav
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        flex: 1,
                        justifyContent: 'center',
                    }}
                ></nav>

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
