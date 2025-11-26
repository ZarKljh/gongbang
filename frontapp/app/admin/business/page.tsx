'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css' // 신고랑 동일 스타일 재사용

type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string

type Shop = {
    id: number
    studioName: string
    studioEmail?: string
    categoryId?: number
    categoryLabel?: string
    ownerUserName?: string
    ownerEmail?: string
    status: SellerStatus
    createdAt?: string
}

// 🔹 enum → 한글 라벨 매핑
const statusKoreanLabel = (status: SellerStatus) => {
    switch (status) {
        case 'PENDING':
            return '대기'
        case 'APPROVED':
            return '승인'
        case 'REJECTED':
            return '반려'
        default:
            return status
    }
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
                return `${styles.badge} ${styles.badgeResolved}`
            case 'REJECTED':
                return `${styles.badge} ${styles.badgeRejected}`
            default:
                return styles.badge
        }
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>입점 신청</h1>
                        <p className={styles.pageSubtitle}>사업주들의 입점 신청을 확인하고 처리 상태를 관리합니다.</p>
                    </div>

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
                                        <th className={styles.firstT}>상태</th>
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
                                            <td className={styles.firstT}>
                                                <span className={statusBadgeClass(s.status)}>
                                                    {statusKoreanLabel(s.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.target}>
                                                    <div>
                                                        <strong>{s.studioName}</strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {s.ownerUserName ?? '-'}
                                                    {s.ownerEmail ? ` (${s.ownerEmail})` : ''}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {s.categoryLabel ??
                                                        (s.categoryId ? `카테고리 #${s.categoryId}` : '-')}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <Link
                                                    className={`${styles.btn} ${styles.btnGhost}`}
                                                    href={`/admin/business/${s.id}`}
                                                >
                                                    상세
                                                </Link>
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
