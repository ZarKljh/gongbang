'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import Modal from '@/app/admin/components/Modal'
import styles from '@/app/admin/styles/AdminReports.module.css'

type Inquiry = {
    id: number
    email: string
    title: string
    content: string
    type: string
    answered: boolean
    createdAt: string
    answerContent?: string
}

type CountResponse = {
    count: number
}

type StatusFilter = 'ALL' | 'UNANSWERED' | 'ANSWERED'

type InquiryStatus = 'PENDING' | 'RESOLVED'

const inquiryStatusFromAnswered = (answered: boolean): InquiryStatus => (answered ? 'RESOLVED' : 'PENDING')

const inquiryStatusBadgeClass = (status: InquiryStatus) => {
    switch (status) {
        case 'PENDING':
            return `${styles.badge} ${styles.badgePending}`
        case 'RESOLVED':
            return `${styles.badge} ${styles.badgeResolved}`
        default:
            return styles.badge
    }
}

const inquiryStatusLabel = (status: InquiryStatus) => {
    switch (status) {
        case 'PENDING':
            return '대기'
        case 'RESOLVED':
            return '처리 완료'
    }
}

export default function AdminInquiriesPage() {
    const [list, setList] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [totalUnread, setTotalUnread] = useState<number>(0)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // ✅ 상세 모달
    const [selected, setSelected] = useState<Inquiry | null>(null)

    // ✅ 상태 필터 (전체 / 미처리 / 처리 완료)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('UNANSWERED')

    // ✅ 검색어
    const [searchText, setSearchText] = useState('')

    // ✅ 모달 내 답변 폼 상태
    const [replyText, setReplyText] = useState('')
    const [replySubmitting, setReplySubmitting] = useState(false)

    const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
        const silent = opts?.silent ?? false
        try {
            if (!silent) setLoading(true)
            setError(null)

            const [listRes, countRes] = await Promise.all([
                api.get('/admin/inquiries'),
                api.get<CountResponse>('/admin/inquiries/count'),
            ])

            const rawList = listRes.data as any
            const inquiries: Inquiry[] = rawList?.data ?? rawList ?? []

            const sorted = [...inquiries].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )

            setList(sorted)
            setTotalUnread(countRes.data?.count ?? 0)
            setLastUpdated(new Date())

            // ✅ 선택된 문의가 있으면 최신 데이터로 동기화
            setSelected((prev) => {
                if (!prev) return prev
                const latest = sorted.find((i) => i.id === prev.id)
                return latest ?? null
            })
        } catch (e: any) {
            if (!silent) {
                setError(e?.message ?? '문의 목록을 불러오는 중 오류가 발생했습니다.')
            }
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }
    }, [])

    // 최초 로딩
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // ✅ 3초 폴링 (⚠ 모달 열려 있을 때는 폴링 중단)
    useEffect(() => {
        if (selected) return

        const id = setInterval(() => {
            fetchData({ silent: true })
        }, 3000)

        return () => clearInterval(id)
    }, [fetchData, selected])

    // ✅ 선택된 문의가 바뀔 때 답변 폼 초기화
    useEffect(() => {
        if (selected) {
            setReplyText(selected.answerContent ?? '')
        } else {
            setReplyText('')
        }
    }, [selected])

    // ✅ 상태 + 검색어 필터
    const filteredList = useMemo(() => {
        let base = list

        // 1) 상태 필터
        switch (statusFilter) {
            case 'UNANSWERED':
                base = base.filter((item) => !item.answered)
                break
            case 'ANSWERED':
                base = base.filter((item) => item.answered)
                break
            case 'ALL':
            default:
                break
        }

        // 2) 검색어 필터
        const q = searchText.trim().toLowerCase()
        if (!q) return base

        return base.filter((item) => {
            const target = `${item.title} ${item.content} ${item.email} ${item.type}`.toLowerCase()
            return target.includes(q)
        })
    }, [list, statusFilter, searchText])

    const handleSubmitReply = async () => {
        if (!selected) return
        if (!replyText.trim()) {
            alert('답변 내용을 입력하세요.')
            return
        }

        try {
            setReplySubmitting(true)

            await api.post(`/admin/inquiries/${selected.id}/answer`, {
                answer: replyText,
            })

            await fetchData()

            setSelected(null)
            setReplyText('')
        } catch (e: any) {
            const raw = e?.response?.data
            let msg: string | null = null

            if (raw) {
                if (typeof raw === 'string') msg = raw
                else if (typeof raw.message === 'string') msg = raw.message
                else if (raw.error) {
                    if (typeof raw.error === 'string') msg = raw.error
                    else if (typeof raw.error?.message === 'string') msg = raw.error.message
                }
            }

            if (!msg && typeof e?.message === 'string') {
                msg = e.message
            }

            alert(msg ?? '답변 등록 중 오류가 발생했습니다.')
        } finally {
            setReplySubmitting(false)
        }
    }

    return (
        <div className={styles.page}>
            <Sidebar />

            <main className={styles.main}>
                {/* 상단 헤더 */}
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>문의 관리</h1>
                        <p className={styles.pageSubtitle}>고객이 남긴 1:1 문의를 확인하고 처리 상태를 관리합니다.</p>
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.counterBox}>
                            <span className={styles.counterLabel}>미처리 건 수</span>
                            <span className={styles.counterValue}>{totalUnread}건</span>
                        </div>

                        {/* 🔍 검색 박스 */}
                        <div>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="제목 / 내용 / 이메일 검색"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <div>
                            <select
                                className={styles.select}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            >
                                <option value="ALL">전체</option>
                                <option value="UNANSWERED">미처리</option>
                                <option value="ANSWERED">처리 완료</option>
                            </select>
                        </div>
                    </div>
                </div>

                <section className={styles.card}>
                    {error && <div className={styles.errorBox}>{error}</div>}

                    {loading ? (
                        <div className={styles.empty}>불러오는 중...</div>
                    ) : filteredList.length === 0 ? (
                        <div className={styles.empty}>표시할 문의가 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.firstT}>상태</th>
                                        <th>유형</th>
                                        <th>제목 / 내용</th>
                                        <th>이메일</th>
                                        <th>작성일</th>
                                        <th>처리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.map((inq) => {
                                        const status = inquiryStatusFromAnswered(inq.answered)
                                        return (
                                            <tr
                                                key={inq.id}
                                                className={inq.answered ? styles.rowAnswered : styles.rowUnread}
                                            >
                                                <td className={styles.firstT}>
                                                    <span className={inquiryStatusBadgeClass(status)}>
                                                        {inquiryStatusLabel(status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.target}>
                                                        <strong>{inq.type}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.reason}>{inq.title}</div>
                                                    <div className={styles.desc}>{inq.content}</div>
                                                </td>
                                                <td>{inq.email}</td>
                                                <td>{new Date(inq.createdAt).toLocaleString()}</td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnGhost}`}
                                                            onClick={() => setSelected(inq)}
                                                        >
                                                            검토하기
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={styles.pollInfo}>
                        3초마다 자동 새로고침
                        {lastUpdated && ` · 마지막 갱신: ${lastUpdated.toLocaleTimeString()}`}
                    </div>
                </section>

                {/* 상세 + 답변 모달 */}
                <Modal
                    open={!!selected}
                    onClose={() => setSelected(null)}
                    title={selected ? `문의 상세 #${selected.id}` : '문의 상세'}
                    size="md"
                >
                    {selected && (
                        <div className={styles.detailBody}>
                            <div className={styles.detailinquiries}>
                                <span className={styles.detailLabel}>상태</span>
                                <span>
                                    {(() => {
                                        const status = inquiryStatusFromAnswered(selected.answered)
                                        return (
                                            <span className={inquiryStatusBadgeClass(status)}>
                                                {inquiryStatusLabel(status)}
                                            </span>
                                        )
                                    })()}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>유형</span>
                                <span>{selected.type}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>이메일</span>
                                <span>{selected.email}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>제목</span>
                                <span>{selected.title}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>작성일</span>
                                <span>{new Date(selected.createdAt).toLocaleString()}</span>
                            </div>

                            <div className={styles.detailContentWrap}>
                                <div className={styles.detailContentLabel}>문의 내용</div>
                                <div className={styles.detailContentBox}>{selected.content}</div>
                            </div>

                            <div className={styles.replySection}>
                                <div className={styles.replyLabelRow}>
                                    <span className={styles.replyLabel}>관리자 답변</span>
                                    {selected.answerContent && (
                                        <span className={styles.replyHint}>(기존 답변을 수정할 수 있습니다)</span>
                                    )}
                                </div>
                                <textarea
                                    className={styles.replyTextarea}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="사용자에게 전달할 답변을 입력하세요."
                                />

                                <div className={styles.replyActions}>
                                    <button
                                        type="button"
                                        onClick={handleSubmitReply}
                                        disabled={replySubmitting}
                                        className={`${styles.replySubmitButton} ${
                                            replySubmitting ? styles.replySubmitButtonDisabled : ''
                                        }`}
                                    >
                                        {replySubmitting
                                            ? '답변 보내는 중...'
                                            : selected.answered
                                            ? '답변 수정 후 완료 처리'
                                            : '답변 보내고 처리 완료'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </main>
        </div>
    )
}
