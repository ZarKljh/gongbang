'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'

type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED' | string

type Report = {
    id: number
    targetType: string
    targetId: number
    reason: string
    description: string
    reporterEmail: string
    status: ReportStatus
    createdAt: string
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<'ALL' | ReportStatus>('PENDING')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // 신고 목록 불러오기
    const loadReports = async () => {
        try {
            setError(null)
            const params: any = {}
            if (statusFilter !== 'ALL') {
                params.status = statusFilter
            }

            const res = await api.get('/admin/reports', { params })
            const list: Report[] = res.data
            setReports(list)
            setLastUpdated(new Date())
        } catch (e: any) {
            console.error('신고 목록 불러오기 실패:', e)
            setError(e?.message ?? '신고 목록을 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    // 최초 로드 + 3초 폴링
    useEffect(() => {
        setLoading(true)
        loadReports()

        const timer = setInterval(() => {
            loadReports()
        }, 3000)

        return () => clearInterval(timer)
        // statusFilter 바뀔 때마다 새 interval 만들기
    }, [statusFilter])

    const statusBadgeClass = (status: ReportStatus) => {
        switch (status) {
            case 'PENDING':
                return `${styles.badge} ${styles.badgePending}`
            case 'RESOLVED':
                return `${styles.badge} ${styles.badgeResolved}`
            case 'REJECTED':
                return `${styles.badge} ${styles.badgeRejected}`
            default:
                return styles.badge
        }
    }

    // 상태 변경 핸들러
    const changeStatus = async (id: number, status: ReportStatus) => {
        try {
            await api.patch(`/admin/reports/${id}/status`, {
                status,
                adminMemo: '', // 필요하면 입력 폼 따로 만들 수 있음
            })
            // 성공하면 즉시 리로드
            await loadReports()
        } catch (e: any) {
            alert(e?.response?.data?.message ?? '상태 변경에 실패했습니다.')
        }
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.headerRow}>
                    <h1 className={styles.title}>신고 관리</h1>

                    <div className={styles.filterGroup}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>상태 필터</span>
                        <select
                            className={styles.select}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="ALL">전체</option>
                            <option value="PENDING">미처리</option>
                            <option value="RESOLVED">처리 완료</option>
                            <option value="REJECTED">기각</option>
                        </select>
                    </div>
                </div>

                <section className={styles.card}>
                    {error && <div style={{ color: '#b91c1c', marginBottom: 8, fontSize: 13 }}>{error}</div>}

                    {loading ? (
                        <div className={styles.empty}>불러오는 중...</div>
                    ) : reports.length === 0 ? (
                        <div className={styles.empty}>현재 조건에 맞는 신고가 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>상태</th>
                                        <th>대상</th>
                                        <th>사유 / 내용</th>
                                        <th>신고자</th>
                                        <th>생성일</th>
                                        <th>처리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r) => (
                                        <tr key={r.id}>
                                            <td>{r.id}</td>
                                            <td>
                                                <span className={statusBadgeClass(r.status)}>{r.status}</span>
                                            </td>
                                            <td>
                                                <div className={styles.target}>
                                                    <div>
                                                        <strong>{r.targetType}</strong>
                                                    </div>
                                                    <div className={styles.meta}>ID: {r.targetId}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.reason}>{r.reason}</div>
                                                <div className={styles.desc}>{r.description}</div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>{r.reporterEmail}</div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    {r.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                className={`${styles.btn} ${styles.btnPrimary}`}
                                                                onClick={() => changeStatus(r.id, 'RESOLVED')}
                                                            >
                                                                검토 시작
                                                            </button>
                                                            <button
                                                                className={`${styles.btn} ${styles.btnDanger}`}
                                                                onClick={() => changeStatus(r.id, 'REJECTED')}
                                                            >
                                                                기각
                                                            </button>
                                                        </>
                                                    )}

                                                    {(r.status === 'RESOLVED' || r.status === 'REJECTED') && (
                                                        <button
                                                            className={`${styles.btn} ${styles.btnGhost}`}
                                                            onClick={() => changeStatus(r.id, 'RESOLVED')}
                                                        >
                                                            다시 검토로
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
