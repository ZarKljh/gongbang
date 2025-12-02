'use client'

import { useState } from 'react'
import styles from '@/app/admin/styles/MySection.module.css'
import api from '@/app/utils/api'
import Modal from '@/app/admin/components/Modal'
import Image from 'next/image'

// 🔹 백엔드 enum과 맞춘 타입들
type ReportTargetType = 'USER' | 'POST' | 'COMMENT' | 'PRODUCT' | 'ORDER' | 'OTHER'
type ReportReason = 'SPAM' | 'ABUSE' | 'FRAUD' | 'COPYRIGHT' | 'PRIVACY' | 'OTHER'

type Props = {
    targetType: ReportTargetType // 예: 상품이면 'PRODUCT', 댓글이면 'COMMENT'
    targetId: number // 신고 대상의 id (상품 id, 댓글 id 등)
}

type Me = {
    id: number
    email: string
    userName: string
}

export default function ReportButton({ targetType, targetId }: Props) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState<ReportReason>('SPAM')
    const [detail, setDetail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // 🔹 신고자 정보 저장
    const [me, setMe] = useState<Me | null>(null)

    const handleClick = async () => {
        try {
            const res = await api.get('/auth/me', { withCredentials: true })

            if (res.status !== 200 || !res.data) {
                if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
                    window.location.href = '/auth/login'
                }
                return
            }

            // 백엔드 응답 구조에 맞게 파싱 (siteUser / data / etc)
            const raw = res.data
            const user: Me =
                raw?.data?.siteUser ??
                raw?.data?.siteUserDto ??
                raw?.data ?? // 혹시 그냥 data에 바로 있는 경우
                raw

            if (!user?.id) {
                if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
                    window.location.href = '/auth/login'
                }
                return
            }

            setMe(user)
            setOpen(true)
        } catch {
            if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
                window.location.href = '/auth/login'
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!me?.id) {
            alert('로그인 정보가 없습니다. 다시 시도해주세요.')
            return
        }

        if (!detail.trim()) {
            alert('신고 사유를 구체적으로 입력해주세요.')
            return
        }

        setSubmitting(true)
        try {
            await api.post(
                '/reports',
                {
                    // 🔹 백엔드 DTO에 맞게 필드 추가
                    reporterId: me.id, // ✅ 신고자 아이디
                    targetType, // ✅ enum 값 (PRODUCT, COMMENT 등)
                    targetId: String(targetId), // 백엔드가 String이면 이렇게, Long이면 그냥 number로
                    reason, // ✅ enum: SPAM / ABUSE ...
                    description: detail,
                },
                { withCredentials: true },
            )

            alert('신고가 접수되었습니다.')
            setOpen(false)
            setReason('SPAM')
            setDetail('')
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                '신고 처리 중 오류가 발생했습니다.'
            alert(msg)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            {/* 신고 버튼 */}
            <button type="button" className={styles.reportButton} onClick={handleClick}>
                <Image src="/images/siren.png" alt="신고 이미지" width={33} height={33} />
            </button>

            {/* 신고 모달 */}
            <Modal open={open} onClose={() => setOpen(false)} title="신고하기" size="sm">
                <form onSubmit={handleSubmit} className={styles.reportForm} noValidate>
                    <div className={styles.formRow}>
                        <label className={styles.label}>신고 유형</label>
                        <select
                            className={styles.select}
                            value={reason}
                            onChange={(e) => setReason(e.target.value as ReportReason)}
                        >
                            <option value="SPAM">스팸/광고</option>
                            <option value="ABUSE">욕설/비하</option>
                            <option value="FRAUD">사기/허위 정보</option>
                            <option value="COPYRIGHT">저작권 침해</option>
                            <option value="PRIVACY">개인정보 침해</option>
                            <option value="OTHER">기타</option>
                        </select>
                    </div>

                    <div className={styles.formRow}>
                        <label className={styles.label}>상세 내용</label>
                        <textarea
                            className={styles.textarea}
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            placeholder="어떤 문제가 있는지 구체적으로 적어주세요."
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`${styles.submitButton} ${submitting ? styles.disabled : ''}`}
                        >
                            {submitting ? '전송 중...' : '신고 보내기'}
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className={styles.closeButton}>
                            취소
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
