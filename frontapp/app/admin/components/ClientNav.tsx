'use client'

import { useEffect, useState } from 'react'
import Modal from '@/app/admin/components/Modal'
import { api } from '@/app/utils/api'
import styles from '@/app/admin/styles/MySection.module.css'

type Me = {
    id: number
    email: string
    userName: string
    fullName?: string
    nickName?: string
    role?: string
}

export default function ClientNav() {
    const [open, setOpen] = useState(false)

    // 로그인 사용자 정보
    const [me, setMe] = useState<Me | null>(null)
    const [meError, setMeError] = useState<string | null>(null)

    // 폼 상태
    const [form, setForm] = useState({
        type: 'OTHER' as 'ACCOUNT' | 'PAYMENT' | 'CONTENT' | 'BUG' | 'FEATURE' | 'BUSINESS' | 'OTHER',
        title: '',
        content: '',
    })

    const [submitting, setSubmitting] = useState(false)

    // ✅ 모달 밖에서 보여줄 메시지 (성공 or 실패)
    const [doneMsg, setDoneMsg] = useState<string | null>(null)

    // 5초 후 자동 숨김
    useEffect(() => {
        if (!doneMsg) return
        const t = setTimeout(() => setDoneMsg(null), 5000)
        return () => clearTimeout(t)
    }, [doneMsg])

    const disabled = submitting || !me?.email || !form.title.trim() || !form.content.trim()

    // 모달 열릴 때 me 없으면 한번만 로드
    useEffect(() => {
        if (!open || me) return
        ;(async () => {
            try {
                setMeError(null)

                const r = await api.get('/auth/me', {
                    headers: { 'Cache-Control': 'no-store' },
                })

                const raw = r.data
                const user: Me = raw?.data?.siteUser ?? raw?.data?.siteUserDto ?? raw?.data ?? raw

                if (!user) {
                    setMeError('사용자 정보를 불러올 수 없습니다.')
                    return
                }

                setMe(user)
            } catch (e: any) {
                let msg = '사용자 정보를 불러오지 못했습니다.'
                if (typeof e?.message === 'string') msg = e.message
                setMeError(msg)
            }
        })()
    }, [open, me])

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (disabled || !me?.email) return

        setSubmitting(true)
        // 모달 안 메시지는 안 쓰니까 여기선 굳이 초기화 안 해도 됨

        try {
            const payload = {
                email: me.email,
                title: form.title,
                content: form.content,
                type: form.type,
            }

            await api.post('/inquiries', payload, {
                headers: { 'Content-Type': 'application/json' },
            })

            // ✅ 성공: 모달 닫고, 폼 초기화 + 바깥에 메시지 띄우기
            setForm({ type: 'OTHER', title: '', content: '' })
            setOpen(false)
            setDoneMsg('문의가 접수되었습니다. 빠르게 답변드릴게요!')
        } catch (err: any) {
            // ✅ 항상 문자열로 msg 만들기 (객체가 children으로 들어가지 않게)
            const raw = err?.response?.data
            let msg: string | null = null

            if (raw) {
                if (typeof raw === 'string') {
                    msg = raw
                } else if (typeof raw.message === 'string') {
                    msg = raw.message
                } else if (raw.error) {
                    if (typeof raw.error === 'string') {
                        msg = raw.error
                    } else if (typeof raw.error?.message === 'string') {
                        msg = raw.error.message
                    }
                }
            }

            if (!msg && typeof err?.message === 'string') {
                msg = err.message
            }

            if (!msg) {
                msg = '문의 접수 중 오류가 발생했습니다.'
            }

            // 모달은 그대로 두고, 화면 아래에 에러 메시지 표시
            setDoneMsg(msg)
        } finally {
            setSubmitting(false)
        }
    }

    const displayName = (me?.nickName || me?.fullName || me?.userName || '').toString()

    return (
        <>
            <div className={styles.inquiryNavWrapper}>
                <button type="button" onClick={() => setOpen(true)} className={styles.inquiryButton}>
                    1:1 문의하기
                </button>
            </div>

            {/* ✅ 모달 밖, 화면 하단/상단 쪽에 토스트 메시지 */}
            {typeof doneMsg === 'string' && doneMsg && <div className={styles.inquiryToast}>{doneMsg}</div>}

            <Modal open={open} onClose={() => setOpen(false)} title="1:1 문의하기" size="md">
                <form onSubmit={onSubmit} className={styles.inquiryForm} noValidate>
                    {/* 로그인 사용자 정보 */}
                    <div className={styles.formGrid}>
                        <div className={styles.formField}>
                            <label className={styles.label}>이름</label>
                            <input
                                readOnly
                                value={displayName}
                                className={styles.readonlyInput}
                                placeholder="로그인 이름"
                            />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.label}>이메일</label>
                            <input
                                readOnly
                                value={me?.email ?? ''}
                                className={styles.readonlyInput}
                                placeholder="로그인 이메일"
                            />
                        </div>
                        {meError && (
                            <div className={`${styles.formField} ${styles.formFieldFull}`}>
                                <div className={styles.errorText}>{meError}</div>
                            </div>
                        )}

                        {/* 문의 유형 */}
                        <div className={`${styles.formField} ${styles.formFieldFull}`}>
                            <label className={styles.label}>문의 유형*</label>
                            <select name="type" value={form.type} onChange={onChange} className={styles.select}>
                                <option value="ACCOUNT">계정 / 로그인</option>
                                <option value="PAYMENT">결제 / 환불</option>
                                <option value="CONTENT">콘텐츠(노출/삭제/저작권)</option>
                                <option value="BUG">오류 / 오작동</option>
                                <option value="FEATURE">기능요청 / 개선제안</option>
                                <option value="BUSINESS">제휴 / 비즈니스</option>
                                <option value="OTHER">기타</option>
                            </select>
                        </div>
                    </div>

                    {/* 제목 */}
                    <div className={styles.formField}>
                        <label className={styles.label}>제목*</label>
                        <input
                            required
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            className={styles.input}
                            placeholder="문의 제목을 입력하세요"
                        />
                    </div>

                    {/* 내용 */}
                    <div className={styles.formField}>
                        <label className={styles.label}>내용*</label>
                        <textarea
                            required
                            name="content"
                            value={form.content}
                            onChange={onChange}
                            className={styles.textarea}
                            placeholder="문의 내용을 적어주세요."
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            disabled={disabled}
                            className={`${styles.submitButton} ${disabled ? styles.submitButtonDisabled : ''}`}
                        >
                            {submitting ? '보내는 중...' : '문의 보내기'}
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className={styles.closeButton}>
                            닫기
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
