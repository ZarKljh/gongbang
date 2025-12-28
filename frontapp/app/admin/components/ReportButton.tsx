'use client'

import { useState } from 'react'
import styles from '@/app/admin/styles/MySection.module.css'
import { api } from '@/app/utils/api'
import Modal from '@/app/admin/components/Modal'
import Image from 'next/image'

// ✅ 팀장 스타일: baseURL 상단 const 선언
const API_BASE_URL = api.defaults.baseURL

// 🔹 백엔드 enum 과 1:1로 맞추기
type ReportTargetType = 'USER' | 'POST' | 'COMMENT' | 'PRODUCT' | 'ORDER' | 'OTHER'
type ReportReason = 'SPAM' | 'ABUSE' | 'FRAUD' | 'COPYRIGHT' | 'PRIVACY' | 'OTHER'

type Props = {
    targetType: ReportTargetType
    targetId: number | string
}

// 로그인 유저 정보 타입 (백엔드 /auth/me 응답 구조에 맞게)
type Me = {
    id: number
    userName: string // ← 로그인 ID (영어 아이디)
    email: string
    nickName?: string
    fullName?: string
    role?: string
}

export default function ReportButton({ targetType, targetId }: Props) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState<ReportReason>('SPAM')
    const [detail, setDetail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [me, setMe] = useState<Me | null>(null)

    // 🔹 신고 버튼 클릭 시
    const handleClick = async () => {
        try {
            // ✅ 팀장 스타일: API_BASE_URL 사용
            const res = await api.get(`${API_BASE_URL}/auth/me`, { withCredentials: true })

            const raw = res.data as any
            const user: Me = raw?.data?.siteUser ?? raw?.data?.siteUserDto ?? raw?.data ?? raw

            if (!user || !user.id) {
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

        if (!me) {
            alert('로그인 정보가 없습니다. 다시 시도해주세요.')
            return
        }

        if (!detail.trim()) {
            alert('신고 사유를 구체적으로 입력해주세요.')
            return
        }

        setSubmitting(true)
        try {
            // ✅ 팀장 스타일: API_BASE_URL 사용
            await api.post(
                `${API_BASE_URL}/reports`,
                {
                    reporterEmail: me.email,
                    reporterUserName: me.userName,
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
                <Image src="/images/siren.png" alt="신고 이미지" width={33} height={33} />
            </button>

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
