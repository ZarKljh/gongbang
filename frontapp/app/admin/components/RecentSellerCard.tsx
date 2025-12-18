'use client'

import { useEffect, useState } from 'react'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/MySection.module.css'

const API_BASE_URL = api.defaults.baseURL

type RecentStudio = {
    id: number
    studioName: string
    studioEmail?: string
    createdAt: string
}

type Props = {
    title?: string
    limit?: number
    pollMs?: number
}

export default function RecentSellerCard({ title = '최근 입점 신청', limit = 6, pollMs = 3000 }: Props) {
    const [items, setItems] = useState<RecentStudio[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = async () => {
        try {
            setError(null)

            // ✅ 상단 const API_BASE_URL 사용
            const res = await api.get(`${API_BASE_URL}/admin/shops/recent`, { params: { limit } })

            const raw = res.data
            const list: RecentStudio[] = Array.isArray(raw) ? raw : raw?.data ?? []
            setItems(list)
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? '최근 입점 신청을 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let stop = false
        setLoading(true)
        load()

        const id = setInterval(() => !stop && load(), pollMs)
        return () => {
            stop = true
            clearInterval(id)
        }
    }, [limit, pollMs])

    return (
        <section className={styles.recentUsersCard}>
            <div className={styles.recentUsersHeader}>
                <h3 className={styles.recentUsersTitle}>{title}</h3>
                <span className={styles.recentUsersSub}>실시간</span>
            </div>

            {loading ? (
                <div className={styles.recentUsersEmpty}>불러오는 중...</div>
            ) : error ? (
                <div className={styles.recentUsersError}>{error}</div>
            ) : items.length === 0 ? (
                <div className={styles.recentUsersEmpty}>최근 입점 신청이 없습니다.</div>
            ) : (
                <ul className={styles.recentUsersList}>
                    {items.map((s) => (
                        <li key={s.id} className={styles.recentUsersItem}>
                            <div className={styles.recentUsersAvatar}>{s.studioName?.[0]?.toUpperCase() ?? 'S'}</div>

                            <div className={styles.recentUsersMeta}>
                                <div className={styles.recentUsersName}>{s.studioName ?? '(이름 없음)'}</div>
                                <div className={styles.recentUsersEmail}>{s.studioEmail ?? '-'}</div>
                            </div>

                            <div className={styles.recentUsersDate}>
                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
