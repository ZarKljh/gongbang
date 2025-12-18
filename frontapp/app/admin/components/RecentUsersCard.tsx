'use client'

import { useEffect, useState } from 'react'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/MySection.module.css'

const API_BASE_URL = api.defaults.baseURL

type RecentUser = {
    id: number
    userName: string
    email: string
    createdDate: string
}

export default function RecentUsersCard({ limit = 6 }: { limit?: number }) {
    const [users, setUsers] = useState<RecentUser[]>([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string | null>(null)

    const load = async () => {
        try {
            setErr(null)

            // ✅ 팀장 스타일: 상단 const API_BASE_URL 사용
            const res = await api.get(`${API_BASE_URL}/admin/users/recent`, { params: { limit } })

            const raw = res.data as any
            const list: RecentUser[] = raw?.data ?? raw ?? []
            setUsers(list)
        } catch (e: any) {
            setErr(e?.response?.data?.message ?? e?.message ?? '최근 가입자를 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        const t = setInterval(load, 3000) // 3초 폴링
        return () => clearInterval(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit])

    return (
        <section className={styles.recentUsersCard}>
            <div className={styles.recentUsersHeader}>
                <h3 className={styles.recentUsersTitle}>최근 가입</h3>
                <span className={styles.recentUsersSub}>실시간</span>
            </div>

            {loading ? (
                <div className={styles.recentUsersEmpty}>불러오는 중...</div>
            ) : err ? (
                <div className={styles.recentUsersError}>{err}</div>
            ) : users.length === 0 ? (
                <div className={styles.recentUsersEmpty}>최근 가입자가 없습니다.</div>
            ) : (
                <ul className={styles.recentUsersList}>
                    {users.map((u) => (
                        <li key={u.id} className={styles.recentUsersItem}>
                            <div className={styles.recentUsersAvatar}>{u.userName?.[0]?.toUpperCase() ?? 'U'}</div>
                            <div className={styles.recentUsersMeta}>
                                <div className={styles.recentUsersName}>{u.userName}</div>
                                <div className={styles.recentUsersEmail}>{u.email}</div>
                            </div>
                            <div className={styles.recentUsersDate}>
                                {u.createdDate ? new Date(u.createdDate).toLocaleDateString() : '-'}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
