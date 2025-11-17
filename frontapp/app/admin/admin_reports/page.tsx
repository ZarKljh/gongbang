'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import Modal from '@/app/admin/components/Modal' // ✅ 모달 추가
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

    // ✅ 모달 상태
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [statusDraft, setStatusDraft] = useState<ReportStatus>('PENDING')
    const [saving, setSaving] = useState(false)

    // 신고 목록 불러오기
    const loadReports = async () => {
        try {
            setError(null)
            const params: any = {}
            if (statusFilter !== 'ALL') params.status = statusFilter

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
        const timer = setInterval(loadReports, 3000)
        return () => clearInterval(timer)
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

    // 상태 변경(목록에서 바로)
    const changeStatus = async (id: number, status: ReportStatus) => {
        try {
            await api.patch(`/admin/reports/${id}/status`, { status, adminMemo: '' })
            await loadReports()
        } catch (e: any) {
            alert(e?.response?.data?.message ?? '상태 변경에 실패했습니다.')
        }
    }

    // ✅ 모달 열기 (상세 조회)
    const openDetail = async (id: number) => {
        setSelectedId(id)
        setDetailOpen(true)
        try {
            const r = await api.get(`/admin/reports/${id}`)
            const data: Report = r.data?.data ?? r.data
            setSelectedReport(data)
            setStatusDraft(data.status)
        } catch (e) {
            console.error('신고 상세 조회 실패:', e)
        }
    }

    // ✅ 모달에서 상태 저장
    const saveDetailStatus = async () => {
        if (!selectedId) return
        setSaving(true)
        try {
            await api.patch(`/admin/reports/${selectedId}/status`, { status: statusDraft, adminMemo: '' })
            setDetailOpen(false)
            setSelectedReport(null)
            await loadReports()
        } catch (e: any) {
            alert(e?.response?.data?.message ?? '상태 저장에 실패했습니다.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>신고 관리</h1>
                        <p className={styles.pageSubtitle}>고객이 남긴 1:1 문의를 확인하고 처리 상태를 관리합니다.</p>
                    </div>

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
                                                    {/* ✅ 모달 열기 버튼 */}
                                                    <button
                                                        className={`${styles.btn} ${styles.btnGhost}`}
                                                        onClick={() => openDetail(r.id)}
                                                    >
                                                        검토하기
                                                    </button>
                                                    {r.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                className={`${styles.btn} ${styles.btnDanger}`}
                                                                onClick={() => changeStatus(r.id, 'REJECTED')}
                                                            >
                                                                기각
                                                            </button>
                                                        </>
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

            {/* ✅ 상세 모달 */}
            {detailOpen && selectedReport && (
                <Modal
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    title={`신고 상세 #${selectedReport.id}`}
                    size="md"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                        <Row label="상태">
                            <select
                                value={statusDraft}
                                onChange={(e) => setStatusDraft(e.target.value as ReportStatus)}
                                className={styles.select}
                            >
                                <option value="PENDING">PENDING (미처리)</option>
                                <option value="RESOLVED">RESOLVED (처리 완료)</option>
                                <option value="REJECTED">REJECTED (기각)</option>
                            </select>
                        </Row>

                        <Row label="신고자">{selectedReport.reporterEmail}</Row>
                        <Row label="대상">
                            {selectedReport.targetType} / {selectedReport.targetId}
                        </Row>
                        <Row label="사유">{selectedReport.reason}</Row>

                        <div>
                            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>신고 내용</div>
                            <div
                                style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    background: '#f9fafb',
                                    padding: 8,
                                    minHeight: 60,
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {selectedReport.description || '(내용 없음)'}
                            </div>
                        </div>

                        <Row label="신고일">
                            {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : '-'}
                        </Row>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setDetailOpen(false)}>
                                닫기
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={saveDetailStatus}
                                disabled={saving}
                            >
                                {saving ? '저장 중...' : '상태 저장'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}

/** 작은 라벨/값 행 컴포넌트 (모달 내부용) */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 96, color: '#6b7280', fontSize: 12 }}>{label}</span>
            <div>{children}</div>
        </div>
    )
}
