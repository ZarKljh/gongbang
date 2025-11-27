// app/components/AdminNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
    const pathname = usePathname()

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

                {/* 가운데 메뉴 */}
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
