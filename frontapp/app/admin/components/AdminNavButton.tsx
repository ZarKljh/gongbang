'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/MySection.module.css'

export default function AdminNavButton() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [checked, setChecked] = useState(false)
    const pathname = usePathname() // ✅ 현재 경로

    useEffect(() => {
        let cancelled = false

        async function checkRole() {
            try {
                setChecked(false)

                const res = await api.get('/auth/me', {
                    withCredentials: true,
                    headers: {
                        'Cache-Control': 'no-store', // 혹시 모를 캐시 방지
                    },
                })

                const data = res.data
                const role = data?.data?.role || data?.data?.siteUser?.role || data?.data?.siteUserDto?.role

                if (!cancelled) {
                    setIsAdmin(role === 'ADMIN')
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
        // 경로가 바뀔 때마다 다시 체크
    }, [pathname])

    if (!checked) return null
    if (!isAdmin) return null

    return (
        <Link href="/admin/admin_account" className={styles.AdminNavButton}>
            관리자 페이지
        </Link>
    )
}
