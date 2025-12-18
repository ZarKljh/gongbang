'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/MySection.module.css'

type MeResponse = {
    data?: {
        role?: string
        siteUser?: { role?: string }
        siteUserDto?: { role?: string }
    }
}

export default function AdminNavButton() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [checked, setChecked] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        let cancelled = false

        const checkRole = async () => {
            try {
                setChecked(false)

                // ✅ api.ts에서 baseURL(/api/v1) + withCredentials 설정되어 있다는 전제
                const res = await api.get<MeResponse>('/auth/me', {
                    headers: { 'Cache-Control': 'no-store' },
                })

                const role =
                    res.data?.data?.role ?? res.data?.data?.siteUser?.role ?? res.data?.data?.siteUserDto?.role ?? ''

                if (!cancelled) {
                    setIsAdmin(role === 'ADMIN' || role === 'ROLE_ADMIN')
                    setChecked(true)
                }
            } catch (err) {
                console.error('관리자 권한 체크 실패:', err)
                if (!cancelled) {
                    setIsAdmin(false)
                    setChecked(true)
                }
            }
        }

        checkRole()

        return () => {
            cancelled = true
        }
    }, [pathname])

    if (!checked) return null
    if (!isAdmin) return null

    return (
        <Link href="/admin/admin_account" className={styles.AdminNavButton}>
            관리자 페이지
        </Link>
    )
}
