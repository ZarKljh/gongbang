'use client'

import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'
import Link from 'next/link'

type Role = 'USER' | 'SELLER'
type UserStatus = 'ACTIVE' | 'BAN' | string

type SiteUserRow = {
    id: number
    userName: string
    fullName?: string
    email: string
    role: Role
    status?: UserStatus
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

    const load = async (opts?: { silent?: boolean }) => {
        const silent = opts?.silent ?? false
        try {
            setError(null)
            if (!silent) setLoading(true)

            // baseURL = .../api/v1 이므로 /api/v1 같은 prefix는 붙이지 않음
            const res = await api.get('/admin/users', { params })

            const list: SiteUserRow[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
            setRows(list)
            setLastUpdated(new Date())
        } catch (e: any) {
            if (!silent) {
                setError(e?.response?.data?.message ?? e?.message ?? '유저 목록을 불러오지 못했습니다.')
            }
        } finally {
            if (!silent) setLoading(false)
        }
    }

    const statusLabel = (status?: string) => {
        switch (status) {
            case 'ACTIVE':
                return '정상'
            case 'BAN':
                return '정지'
            default:
                return status ?? '-'
        }
    }

    const badge = (status?: string) => {
        if (!status) return styles.badge

        switch (status) {
            case 'ACTIVE':
                return (styles as any).badgeActive ? `${styles.badge} ${(styles as any).badgeActive}` : styles.badge
            case 'BAN':
                return (styles as any).badgeBAN ? `${styles.badge} ${(styles as any).badgeBAN}` : styles.badge
            default:
                return styles.badge
        }
    }

    // 최초 로드 + 3초 폴링 (필터/검색 바뀌면 즉시 재폴링)
    useEffect(() => {
        load()
        const tm = setInterval(() => load({ silent: true }), 3000)
        return () => clearInterval(tm)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params])

    // 역할 변경 (현재 UI에서는 호출 안 하고 있지만 함수는 유지)
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
                        <div className={styles.searchBox}>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="아이디/이메일 검색"
                                className={styles.searchInput}
                            />
                        </div>

                        <select
                            className={styles.select}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="ALL">전체상태</option>
                            <option value="ACTIVE">정상</option>
                            <option value="BAN">정지</option>
                        </select>

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
                </div>

                <section className={styles.card}>
                    {error && <div className={(styles as any).errorBox ?? styles.empty}>{error}</div>}

                    {loading ? (
                        <div className={styles.empty}>불러오는 중...</div>
                    ) : rows.length === 0 ? (
                        <div className={styles.empty}>조건에 맞는 유저가 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.firstT}>상태</th>
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
                                            <td className={styles.firstT}>
                                                {u.status ? (
                                                    <span className={badge(u.status)}>{statusLabel(u.status)}</span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>

                                            <td>{u.userName}</td>
                                            <td>{u.fullName ?? '-'}</td>
                                            <td>{u.email}</td>

                                            <td>
                                                <div className={(styles as any).roleCell ?? ''}>
                                                    <span className={(styles as any).roleText ?? ''}>{u.role}</span>
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
