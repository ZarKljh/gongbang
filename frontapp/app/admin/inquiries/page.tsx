'use client'

import { useCallback, useEffect, useState } from 'react'
import Sidebar from '@/app/admin/components/Sidebar'
import { api } from '@/app/utils/api'
import layoutStyles from '@/app/admin/styles/MySection.module.css'
import styles from '@/app/admin/styles/AdminInquiries.module.css'
import Modal from '@/app/admin/components/Modal'

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

export default function AdminInquiriesPage() {
    const [list, setList] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [totalUnread, setTotalUnread] = useState<number>(0)

    const [selected, setSelected] = useState<Inquiry | null>(null)
    const [ackLoading, setAckLoading] = useState(false)

    const [showOnlyUnread, setShowOnlyUnread] = useState(false)

    // 모달 내 답변 폼 상태
    const [replyText, setReplyText] = useState('')
    const [replySubmitting, setReplySubmitting] = useState(false)

    // ✅ 목록 + 미처리 카운트 불러오기 (공용 함수)
    const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
        const silent = opts?.silent ?? false
        try {
            if (!silent) {
                setLoading(true)
            }
            setError(null)

            const [listRes, countRes] = await Promise.all([
                api.get('/admin/inquiries'),
                api.get<CountResponse>('/admin/inquiries/count'),
            ])

            const rawList = listRes.data as any
            const inquiries: Inquiry[] = rawList?.data ?? rawList ?? []

            setList(inquiries)
            setTotalUnread(countRes.data?.count ?? 0)
        } catch (e: any) {
            // 폴링 중 에러는 조용히 무시하고, 수동 로딩/첫 로딩에서만 표시되는 느낌으로 갈 수도 있음
            if (!opts?.silent) {
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

    // ✅ 3초 폴링
    useEffect(() => {
        const id = setInterval(() => {
            fetchData({ silent: true })
        }, 3000) // 3초마다

        return () => clearInterval(id)
    }, [fetchData])

    // 선택된 문의가 바뀔 때 답변 폼 초기화
    useEffect(() => {
        if (selected) {
            setReplyText(selected.answerContent ?? '')
        } else {
            setReplyText('')
        }
    }, [selected])

    const handleAckAll = async () => {
        if (!confirm('모든 미처리 문의를 "처리 완료"로 표시할까요?')) return

        try {
            setAckLoading(true)
            await api.post('/api/admin/v1/inquiries/ack')
            await fetchData()
        } catch (e: any) {
            alert(e?.message ?? '처리 중 오류가 발생했습니다.')
        } finally {
            setAckLoading(false)
        }
    }

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

            // 최신 데이터 다시 불러오기
            await fetchData()
            // 모달 닫기 (미처리 필터 켜져 있으면 리스트에서 자연스럽게 사라짐)
            setSelected(null)
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

    const filteredList = showOnlyUnread ? list.filter((item) => !item.answered) : list

    return (
        <div className={layoutStyles.dashboardLayout}>
            <Sidebar />

            <main className={layoutStyles.mainArea}>
                {/* 상단 헤더 */}
                <section className={styles.headerSection}>
                    <div>
                        <h1 className={styles.pageTitle}>문의 관리</h1>
                        <p className={styles.pageSubtitle}>고객이 남긴 1:1 문의를 확인하고 처리 상태를 관리합니다.</p>
                    </div>

                    <div className={styles.headerRight}>
                        <div className={styles.counterBox}>
                            <span className={styles.counterLabel}>미처리 문의</span>
                            <span className={styles.counterValue}>{totalUnread}건</span>
                        </div>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => fetchData()}
                            disabled={loading}
                        >
                            새로고침
                        </button>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleAckAll}
                            disabled={ackLoading || totalUnread === 0}
                        >
                            {ackLoading ? '처리 중...' : '전체 처리 완료'}
                        </button>
                    </div>
                </section>

                {/* 필터/에러 표시 */}
                <section className={styles.controlSection}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={showOnlyUnread}
                            onChange={(e) => setShowOnlyUnread(e.target.checked)}
                        />
                        미처리 문의만 보기
                    </label>

                    {error && <div className={styles.errorBox}>{error}</div>}
                </section>

                {/* 테이블 */}
                <section className={styles.tableSection}>
                    {loading && <div className={styles.infoText}>불러오는 중...</div>}

                    {!loading && filteredList.length === 0 && (
                        <div className={styles.infoText}>표시할 문의가 없습니다.</div>
                    )}

                    {!loading && filteredList.length > 0 && (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>상태</th>
                                        <th>유형</th>
                                        <th>제목</th>
                                        <th>이메일</th>
                                        <th>작성일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.map((inq) => (
                                        <tr
                                            key={inq.id}
                                            className={inq.answered ? styles.rowAnswered : styles.rowUnread}
                                            onClick={() => setSelected(inq)}
                                        >
                                            <td>{inq.id}</td>
                                            <td>
                                                <span
                                                    className={
                                                        inq.answered ? styles.badgeAnswered : styles.badgePending
                                                    }
                                                >
                                                    {inq.answered ? '처리 완료' : '미처리'}
                                                </span>
                                            </td>
                                            <td>{inq.type}</td>
                                            <td className={styles.titleCell}>{inq.title}</td>
                                            <td>{inq.email}</td>
                                            <td>{new Date(inq.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>상태</span>
                                <span>
                                    <span className={selected.answered ? styles.badgeAnswered : styles.badgePending}>
                                        {selected.answered ? '처리 완료' : '미처리'}
                                    </span>
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

                            {/* 문의 본문 */}
                            <div className={styles.detailContentWrap}>
                                <div className={styles.detailContentLabel}>문의 내용</div>
                                <div className={styles.detailContentBox}>{selected.content}</div>
                            </div>

                            {/* 관리자 답변 입력 */}
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
                                        disabled={replySubmitting || !replyText.trim()}
                                        className={`${styles.replySubmitButton} ${
                                            replySubmitting || !replyText.trim() ? styles.replySubmitButtonDisabled : ''
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
