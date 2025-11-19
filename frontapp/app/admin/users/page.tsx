'use client'

import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'
import Link from 'next/link'

type Role = 'USER' | 'SELLER'

type UserStatus = 'ACTIVE' | 'BAN'

type SiteUserRow = {
    id: number
    userName: string
    fullName?: String
    email: string
    role: Role
    status: string
    createdDate?: string
    updatedDate?: string
}

export default function AdminUsersPage() {
    const [rows, setRows] = useState<SiteUserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 필터 상태
    const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BAN'>('ACTIVE')
    const [q, setQ] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const params = useMemo(() => {
        const p: Record<string, any> = {}
        if (roleFilter !== 'ALL') p.role = roleFilter
        if (statusFilter !== 'ALL') p.status = statusFilter
        if (q.trim()) p.q = q.trim()
        return p
    }, [roleFilter, statusFilter, q])

    const load = async () => {
        try {
            setError(null)
            const res = await api.get('/admin/users', { params })
            const list: SiteUserRow[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
            setRows(list)
            setLastUpdated(new Date())
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? '유저 목록을 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const statusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return '정상'
            case 'BAN':
                return '정지'
            default:
                return status // 혹시 모를 다른 값 대비
        }
    }

    // 최초 로드 + 3초 폴링
    useEffect(() => {
        setLoading(true)
        load()
        const tm = setInterval(load, 3000)
        return () => clearInterval(tm)
    }, [params]) // 필터/검색 바뀌면 즉시 재폴링

    const badge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return `${styles.badge} ${styles.badgeActive}`
            case 'BAN':
                return `${styles.badge} ${styles.badgeBAN}`
            default:
                return styles.badge
        }
    }

    // 역할 변경
    const changeRole = async (id: number, role: Role) => {
        try {
            await api.patch(`/admin/users/${id}/role`, { role })
            await load()
        } catch (e: any) {
            alert(e?.response?.data?.message ?? '역할 변경에 실패했습니다.')
        }
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>유저 관리</h1>
                        <p className={styles.pageSubtitle}>고객들을 확인하고 처리 상태를 관리합니다.</p>
                    </div>

                    {/* 필터 그룹 */}
                    <div className={styles.filterGroup}>
                        <select
                            className={styles.select}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="ALL">전체상태</option>
                            <option value="ACTIVE">정상</option>
                            <option value="BAN">정지</option>
                        </select>
                        <div className={styles.filterGroup}>
                            <select
                                className={styles.select}
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as any)}
                            >
                                <option value="ALL">전체</option>
                                <option value="USER">USER</option>
                                <option value="SELLER">SELLER</option>
                            </select>
                        </div>

                        <div className={styles.searchBox}>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="아이디/이메일 검색"
                                className={styles.searchInput}
                            />
                        </div>
                    </div>
                </div>

                <section className={styles.card}>
                    {error && <div className={styles.error}>{error}</div>}

                    {loading ? (
                        <div className={styles.empty}>불러오는 중...</div>
                    ) : rows.length === 0 ? (
                        <div className={styles.empty}>조건에 맞는 유저가 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>상태</th>
                                        <th>아이디</th>
                                        <th>이름</th>
                                        <th>이메일</th>
                                        <th>역할</th>
                                        <th>가입일</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((u) => (
                                        <tr key={u.id}>
                                            <td>
                                                {u.status ? (
                                                    <span className={badge(u.status)}>{statusLabel(u.status)}</span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>

                                            <td>{u.userName}</td>
                                            <td>{u.fullName}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <div className={styles.roleCell}>
                                                    <span className={styles.roleText}>{u.role}</span>
                                                </div>
                                            </td>

                                            <td>{u.createdDate ? new Date(u.createdDate).toLocaleString() : '-'}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <Link
                                                        className={`${styles.btn} ${styles.btnGhost}`}
                                                        href={`/admin/users/${u.id}`}
                                                    >
                                                        상세
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={styles.pollInfo}>
                        3초마다 자동 새로고침
                        {lastUpdated && ` · 마지막 갱신: ${lastUpdated.toLocaleTimeString()}`}
                    </div>
                </section>
            </main>
        </div>
    )
}
