'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css' // 디자인 동일하게 재사용

type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string

type Shop = {
    id: number
    studioName: string
    studioEmail?: string
    categoryId?: number
    ownerUserName?: string
    ownerEmail?: string
    status: SellerStatus
    createdAt?: string
}

export default function AdminBusinessPage() {
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<'ALL' | SellerStatus>('PENDING')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const loadShops = async () => {
        try {
            setError(null)
            const params: any = {}
            if (statusFilter !== 'ALL') params.status = statusFilter

            // 백엔드 목록 API 경로
            const res = await api.get('/admin/shops', { params })
            const list: Shop[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
            setShops(list)
            setLastUpdated(new Date())
        } catch (e: any) {
            console.error('입점 신청 목록 불러오기 실패:', e)
            setError(e?.response?.data?.message ?? e?.message ?? '입점 신청을 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        loadShops()
        const timer = setInterval(loadShops, 3000) // 3초 폴링
        return () => clearInterval(timer)
    }, [statusFilter])

    const statusBadgeClass = (status: SellerStatus) => {
        switch (status) {
            case 'PENDING':
                return `${styles.badge} ${styles.badgePending}`
            case 'APPROVED':
                return `${styles.badge} ${styles.badgeResolved}` // 초록색 계열 재사용
            case 'REJECTED':
                return `${styles.badge} ${styles.badgeRejected}`
            default:
                return styles.badge
        }
    }

    const changeStatus = async (id: number, status: SellerStatus) => {
        try {
            // 상태 변경 API (필요 시 adminMemo 등 추가 가능)
            await api.patch(`/admin/shops/${id}/status`, { status })
            await loadShops()
        } catch (e: any) {
            alert(e?.response?.data?.message ?? '상태 변경에 실패했습니다.')
        }
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.headerRow}>
                    <h1 className={styles.title}>입점 신청</h1>

                    <div className={styles.filterGroup}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>상태 필터</span>
                        <select
                            className={styles.select}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="ALL">전체</option>
                            <option value="PENDING">대기</option>
                            <option value="APPROVED">승인</option>
                            <option value="REJECTED">반려</option>
                        </select>
                    </div>
                </div>

                <section className={styles.card}>
                    {error && <div style={{ color: '#b91c1c', marginBottom: 8, fontSize: 13 }}>{error}</div>}

                    {loading ? (
                        <div className={styles.empty}>불러오는 중...</div>
                    ) : shops.length === 0 ? (
                        <div className={styles.empty}>현재 조건에 맞는 입점 신청이 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>상태</th>
                                        <th>스튜디오</th>
                                        <th>신청자</th>
                                        <th>카테고리</th>
                                        <th>신청일</th>
                                        <th>처리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shops.map((s) => (
                                        <tr key={s.id}>
                                            <td>
                                                <span className={statusBadgeClass(s.status)}>{s.status}</span>
                                            </td>
                                            <td>
                                                <div className={styles.target}>
                                                    <div>
                                                        <strong>{s.studioName}</strong>
                                                    </div>
                                                    <div className={styles.meta}>{s.studioEmail ?? '-'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {s.ownerUserName ?? '-'} {s.ownerEmail ? `(${s.ownerEmail})` : ''}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {s.categoryId != null ? `#${s.categoryId}` : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    {s.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                className={`${styles.btn} ${styles.btnPrimary}`}
                                                                onClick={() => changeStatus(s.id, 'APPROVED')}
                                                            >
                                                                승인
                                                            </button>
                                                            <button
                                                                className={`${styles.btn} ${styles.btnDanger}`}
                                                                onClick={() => changeStatus(s.id, 'REJECTED')}
                                                            >
                                                                반려
                                                            </button>
                                                        </>
                                                    )}

                                                    {s.status === 'APPROVED' && (
                                                        <button
                                                            className={`${styles.btn} ${styles.btnGhost}`}
                                                            onClick={() => changeStatus(s.id, 'PENDING')}
                                                        >
                                                            대기로 변경
                                                        </button>
                                                    )}

                                                    {s.status === 'REJECTED' && (
                                                        <button
                                                            className={`${styles.btn} ${styles.btnGhost}`}
                                                            onClick={() => changeStatus(s.id, 'PENDING')}
                                                        >
                                                            대기로 변경
                                                        </button>
                                                    )}
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
