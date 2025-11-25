'use client'

import { useState } from 'react'
import styles from '@/app/admin/styles/MySection.module.css'
import api from '@/app/utils/api'
import Modal from '@/app/admin/components/Modal'
import Image from 'next/image'

type Props = {
    targetType: 'REVIEW' | 'COMMENT'
    targetId: number
}

export default function ReportButton({ targetType, targetId }: Props) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('SPAM')
    const [detail, setDetail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleClick = async () => {
        // 🔹 신고 버튼은 항상 보이게 하고,
        //    눌렀을 때 로그인 안 되어 있으면 그때 로그인 유도
        try {
            const res = await api.get('/auth/me', { withCredentials: true })
            if (res.status !== 200) {
                if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
                    window.location.href = '/auth/login'
                }
                return
            }
            setOpen(true)
        } catch {
            if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
                window.location.href = '/auth/login'
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!detail.trim()) {
            alert('신고 사유를 구체적으로 입력해주세요.')
            return
        }

        setSubmitting(true)
        try {
            await api.post(
                '/reports',
                {
                    targetType,
                    targetId: String(targetId),
                    reason,
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
            <button type="button" className={styles.reportButton} onClick={handleClick}>
                <Image src="/images/siren.png" alt="신고 이미지" width={33} height={33}></Image>
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="리뷰 신고" size="sm">
                <form onSubmit={handleSubmit} className={styles.reportForm} noValidate>
                    <div className={styles.formRow}>
                        <label className={styles.label}>신고 유형</label>
                        <select
                            className={styles.select}
                            value={reason}
                            onChange={(e) => setReason(e.target.value as any)}
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
