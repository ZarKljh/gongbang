'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminNavButton() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function checkRole() {
            try {
                const res = await fetch('/api/v1/auth/me', {
                    method: 'GET',
                    credentials: 'include', // ✅ 쿠키 필수
                })

                if (!res.ok) {
                    if (!cancelled) setChecked(true)
                    return
                }

                const data = await res.json()
                const role = data?.data?.role || data?.data?.siteUser?.role || data?.data?.siteUserDto?.role

                if (!cancelled) {
                    setIsAdmin(role === 'ADMIN')
                    setChecked(true)
                }
            } catch (err) {
                console.error('관리자 권한 체크 실패:', err)
                if (!cancelled) setChecked(true)
            }
        }

        checkRole()
        return () => {
            cancelled = true
        }
    }, [])

    if (!checked) return null // 로딩 전에는 아무것도 안 보여줌
    if (!isAdmin) return null // 일반 유저는 표시 안 함

    return (
        <Link href="/admin/admin_account" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">
            관리자 페이지
        </Link>
    )
}
