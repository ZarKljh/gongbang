'use client'

import { useEffect, useState } from 'react'
import Modal from '@/app/admin/components/Modal'
import api from '../../utils/api' // axios 인스턴스 (baseURL + withCredentials 설정돼 있다고 가정)

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

    // 로그인 사용자 정보 (자동 채움용)
    const [me, setMe] = useState<Me | null>(null)
    const [meError, setMeError] = useState<string | null>(null)

    // 폼 (서버 기대값: email, title, content, type)
    const [form, setForm] = useState({
        type: 'OTHER' as 'ACCOUNT' | 'PAYMENT' | 'CONTENT' | 'BUG' | 'FEATURE' | 'PARTNERSHIP' | 'OTHER',
        title: '',
        content: '',
    })

    const [submitting, setSubmitting] = useState(false)
    const [doneMsg, setDoneMsg] = useState<string | null>(null)

    // 비활성 조건: 로그인 이메일이 있어야 하고, 제목/내용 필수
    const disabled = submitting || !me?.email || !form.title.trim() || !form.content.trim()

    // 모달 열릴 때 사용자 정보가 없으면 한번만 로드
    useEffect(() => {
        if (!open || me) return
        ;(async () => {
            try {
                setMeError(null)

                const r = await api.get('/api/v1/auth/me', {
                    headers: { 'Cache-Control': 'no-store' },
                })

                const raw = r.data
                // 백엔드 응답 래핑 형태 대비
                const user: Me = raw?.data?.siteUser ?? raw?.data?.siteUserDto ?? raw?.data ?? raw

                if (!user) {
                    setMeError('사용자 정보를 불러올 수 없습니다.')
                    return
                }

                setMe(user)
            } catch (e: any) {
                setMeError(e?.message ?? '사용자 정보를 불러오지 못했습니다.')
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
        setDoneMsg(null)

        try {
            const payload = {
                email: me.email, // 로그인 이메일 사용
                title: form.title,
                content: form.content,
                type: form.type, // enum: ACCOUNT/PAYMENT/CONTENT/BUG/FEATURE/PARTNERSHIP/OTHER
            }

            // ❗️이제는 admin 말고 유저용 엔드포인트로 보냄
            await api.post('/api/v1/inquiries', payload, {
                headers: { 'Content-Type': 'application/json' },
            })

            setDoneMsg('문의가 접수되었습니다. 빠르게 답변드릴게요!')
            setOpen(false)
            setForm({ type: 'OTHER', title: '', content: '' })
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                '문의 접수 중 오류가 발생했습니다.'
            setDoneMsg(msg)
        } finally {
            setSubmitting(false)
        }
    }

    // 표시할 이름: 닉네임 > 실명 > 아이디
    const displayName = (me?.nickName || me?.fullName || me?.userName || '').toString()

    return (
        <>
            <button onClick={() => setOpen(true)} className="h-9 rounded-xl border px-3 text-sm">
                1:1 문의하기
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="1:1 문의하기" size="md">
                <form onSubmit={onSubmit} className="space-y-3" noValidate>
                    {/* 로그인 사용자 정보 (읽기 전용 표시) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">이름</label>
                            <input
                                readOnly
                                value={displayName}
                                className="w-full h-10 rounded-xl border px-3 text-sm bg-slate-50"
                                placeholder="로그인 이름"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">이메일</label>
                            <input
                                readOnly
                                value={me?.email ?? ''}
                                className="w-full h-10 rounded-xl border px-3 text-sm bg-slate-50"
                                placeholder="로그인 이메일"
                            />
                        </div>
                        {meError && <div className="sm:col-span-2 text-xs text-rose-600">{meError}</div>}

                        {/* 문의 유형 */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-slate-500 mb-1">문의 유형*</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={onChange}
                                className="w-full h-10 rounded-xl border px-3 text-sm bg-white"
                            >
                                <option value="ACCOUNT">계정 / 로그인</option>
                                <option value="PAYMENT">결제 / 환불</option>
                                <option value="CONTENT">콘텐츠(노출/삭제/저작권)</option>
                                <option value="BUG">오류 / 오작동</option>
                                <option value="FEATURE">기능요청 / 개선제안</option>
                                <option value="PARTNERSHIP">제휴 / 비즈니스</option>
                                <option value="OTHER">기타</option>
                            </select>
                        </div>
                    </div>

                    {/* 제목 */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">제목*</label>
                        <input
                            required
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            className="w-full h-10 rounded-xl border px-3 text-sm"
                            placeholder="문의 제목을 입력하세요"
                        />
                    </div>

                    {/* 내용 */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">내용*</label>
                        <textarea
                            required
                            name="content"
                            value={form.content}
                            onChange={onChange}
                            className="w-full min-h-[120px] rounded-2xl border px-3 py-2 text-sm"
                            placeholder="문의 내용을 적어주세요."
                        />
                    </div>

                    {doneMsg && (
                        <div className="rounded-xl border p-3 text-xs text-slate-700 bg-slate-50">{doneMsg}</div>
                    )}

                    <div className="pt-1 flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={disabled}
                            className={`h-9 px-3 rounded-xl text-sm text-white ${
                                disabled ? 'bg-slate-300' : 'bg-slate-900 hover:bg-slate-800'
                            }`}
                        >
                            {submitting ? '보내는 중...' : '문의 보내기'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="h-9 px-3 rounded-xl border text-sm hover:bg-slate-50"
                        >
                            닫기
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
