'use client'

import { useEffect, useState, useMemo } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import Modal from '@/app/admin/components/Modal'
import styles from '@/app/admin/styles/AdminReports.module.css'

type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED' | string

type Report = {
    id: number
    targetType: string
    targetId: number | string
    reason: string
    description: string
    reporterUserName: string | null
    reporterEmail: string | null
    status: ReportStatus
    createdAt: string
}

/** 🔹 신고 대상에 따라 실제 프론트 URL을 만들어주는 함수
 *  프로젝트 라우팅 규칙에 맞게 아래만 수정하면 됨
 */
function resolveTargetUrl(r: Report): string | null {
    switch (r.targetType) {
        case 'PRODUCT':
            return `/product/list/detail?productId=${r.targetId}`

        // 필요하면 나중에 리뷰, 문의 등도 추가
        // case 'REVIEW':
        //     return `/review/${r.targetId}`

        // case 'INQUIRY':
        //     return `/mypage?tab=qna&id=${r.targetId}`

        default:
            return null
    }
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<'ALL' | ReportStatus>('PENDING')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // ✅ 미처리(PENDING) 건 수
    const [totalPending, setTotalPending] = useState<number>(0)

    // ✅ 검색어 상태
    const [search, setSearch] = useState('')

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

            const [listRes, pendingRes] = await Promise.all([
                api.get('/admin/reports', { params }),
                api.get('/admin/reports', { params: { status: 'PENDING' } }),
            ])

            const list: Report[] = listRes.data
            const pendingList: Report[] = pendingRes.data

            const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            setReports(sorted)
            setTotalPending(pendingList.length)
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

    // 🔹 enum → 한글 라벨 매핑
    const statusKoreanLabel = (status: ReportStatus) => {
        switch (status) {
            case 'PENDING':
                return '대기'
            case 'RESOLVED':
                return '처리 완료'
            case 'REJECTED':
                return '기각'
            default:
                return status
        }
    }

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

    const filteredReports = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return reports

        return reports.filter((r) => {
            const userName = r.reporterUserName?.toLowerCase() ?? ''
            const email = r.reporterEmail?.toLowerCase() ?? ''
            const targetType = r.targetType?.toLowerCase() ?? ''
            const reason = r.reason?.toLowerCase() ?? ''
            const desc = r.description?.toLowerCase() ?? ''

            return (
                userName.includes(q) ||
                email.includes(q) ||
                targetType.includes(q) ||
                reason.includes(q) ||
                desc.includes(q)
            )
        })
    }, [reports, search])

    // 상태 변경(목록에서 바로)
    const changeStatus = async (id: number, status: ReportStatus) => {
        try {
            await api.patch(`/admin/reports/${id}/status`, { status, adminMemo: '' })
            await loadReports()
        } catch (e: any) {
            alert(e?.response?.data?.message ?? '상태 변경에 실패했습니다.')
        }
    }

    // ✅ 대상 페이지로 이동
    const goToTargetPage = (report: Report) => {
        const url = resolveTargetUrl(report)
        if (!url) {
            alert('이 신고 유형에 대한 대상 페이지 이동 경로가 설정되어 있지 않습니다.')
            return
        }
        window.open(url, '_blank') // 새 탭으로 열기
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
                        <p className={styles.pageSubtitle}>고객이 남긴 신고를 확인하고 처리 상태를 관리합니다.</p>
                    </div>

                    <div className={styles.filterGroup}>
                        {/* ✅ 미처리 건 수 박스 */}
                        <div className={styles.counterBox}>
                            <span className={styles.counterLabel}>미처리 건 수</span>
                            <span className={styles.counterValue}>{totalPending}건</span>
                        </div>

                        {/* ✅ 검색 박스 */}
                        <div className={styles.searchBox}>
                            <input
                                className={styles.searchInput}
                                placeholder="신고자 / 대상 / 사유 / 내용 검색"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* ✅ 상태 필터 셀렉트 */}
                        <div>
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
                </div>

                <section className={styles.card}>
                    {error && <div style={{ color: '#b91c1c', marginBottom: 8, fontSize: 13 }}>{error}</div>}

                    {loading ? (
                        <div className={styles.empty}>불러오는 중...</div>
                    ) : filteredReports.length === 0 ? (
                        <div className={styles.empty}>현재 조건에 맞는 신고가 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.firstT}>상태</th>
                                        <th>대상</th>
                                        <th>사유 / 내용</th>
                                        <th>신고자</th>
                                        <th>생성일</th>
                                        <th>처리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map((r) => (
                                        <tr key={r.id}>
                                            <td className={styles.firstT}>
                                                <span className={statusBadgeClass(r.status)}>
                                                    {statusKoreanLabel(r.status)}
                                                </span>
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
                                                <div className={styles.meta}>
                                                    {r.reporterUserName ?? '(알 수 없음)'}
                                                </div>
                                                <div className={styles.metaSmall}>
                                                    {r.reporterEmail ?? '(이메일 없음)'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.meta}>
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={`${styles.btn} ${styles.btnGhost}`}
                                                        onClick={() => openDetail(r.id)}
                                                    >
                                                        검토하기
                                                    </button>

                                                    {r.status === 'PENDING' && (
                                                        <button
                                                            className={`${styles.btn} ${styles.btnDanger}`}
                                                            onClick={() => changeStatus(r.id, 'REJECTED')}
                                                        >
                                                            기각
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

                        <Row label="신고자">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>{selectedReport.reporterUserName ?? '(알 수 없음)'}</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>
                                    {selectedReport.reporterEmail ?? '(이메일 없음)'}
                                </span>
                            </div>
                        </Row>

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

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 8,
                                marginTop: 12,
                                alignItems: 'center',
                            }}
                        >
                            {/* 🔹 모달 안에서도 대상 페이지 바로 열기 */}
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnGhost}`}
                                onClick={() => goToTargetPage(selectedReport)}
                            >
                                대상 페이지 열기
                            </button>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    className={`${styles.btn} ${styles.btnGhost}`}
                                    onClick={() => setDetailOpen(false)}
                                >
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
