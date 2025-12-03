'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import api from '@/app/utils/api'
import styles from './CustomerCenter.module.css'

import ClientNav from '@/app/admin/components/ClientNav'

type Id = string

type FaqCategory = {
    id: Id
    name: string
    slug: string
    orderNo: number
    active: boolean
}

type FaqItem = {
    id: Id
    categoryId: Id
    categoryName: string
    categorySlug: string
    question: string
    answer: string
    orderNo: number
    published: boolean
}

export default function CustomerCenterPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [categories, setCategories] = useState<FaqCategory[]>([])
    const [faqs, setFaqs] = useState<FaqItem[]>([])

    const [selectedCatId, setSelectedCatId] = useState<Id | 'all'>('all')
    const [q, setQ] = useState('')
    const [expandedId, setExpandedId] = useState<Id | null>(null)

    // -------------- 데이터 로딩 --------------
    async function safe<T>(p: Promise<{ data: any }>, fallbackMsg: string): Promise<T> {
        try {
            const { data } = await p
            return data as T
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || fallbackMsg
            throw new Error(msg)
        }
    }

    async function loadCategories() {
        // ⚠️ 엔드포인트는 백엔드에 맞게 수정해줘 (/admin/faq/categories를 열어둘 거면 그걸 써도 됨)
        const data = await safe<{ content?: FaqCategory[] } | FaqCategory[]>(
            api.get('/faq/categories', {
                params: { page: 0, size: 100, sort: 'orderNo,asc' },
            }),
            '카테고리 로드 실패',
        )
        const list = Array.isArray(data) ? data : data.content ?? []
        setCategories(list.filter((c) => c.active))
    }

    async function loadFaqs() {
        const params: any = { page: 0, size: 200 } // 고객센터에서는 좀 넉넉하게
        if (selectedCatId !== 'all') params.categoryId = String(selectedCatId)
        if (q.trim()) params.q = q.trim()

        const data = await safe<{ content?: FaqItem[] } | FaqItem[]>(api.get('/faq', { params }), 'FAQ 로드 실패')
        const list = Array.isArray(data) ? data : data.content ?? []
        setFaqs(list.filter((f) => f.published))
    }

    async function loadAll() {
        setError(null)
        setLoading(true)
        try {
            await loadCategories()
            await loadFaqs()
        } catch (e: any) {
            setError(e?.message ?? '고객센터 정보를 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!loading) {
            loadFaqs().catch((e) => setError(e?.message ?? 'FAQ 로드 실패'))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCatId, q])

    const filteredFaqs = useMemo(() => {
        return faqs.sort((a, b) => a.orderNo - b.orderNo)
    }, [faqs])

    const selectedCatName =
        selectedCatId === 'all' ? '전체' : categories.find((c) => c.id === selectedCatId)?.name ?? '전체'

    const toggleExpand = (id: Id) => {
        setExpandedId((prev) => (prev === id ? null : id))
    }

    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                {/* 왼쪽 : FAQ 리스트 */}
                <section className={styles.left}>
                    <header className={styles.header}>
                        <div>
                            <h1 className={styles.title}>고객센터</h1>
                            <p className={styles.subtitle}>
                                궁금하신 내용을 먼저 FAQ에서 찾아보시고, 해결되지 않으면 1:1 문의를 남겨주세요.
                            </p>
                        </div>
                    </header>

                    {/* 카테고리 + 검색 박스 */}
                    <div className={styles.toolbar}>
                        <div className={styles.categoryChips}>
                            <button
                                type="button"
                                className={`${styles.chip} ${selectedCatId === 'all' ? styles.chipActive : ''}`}
                                onClick={() => setSelectedCatId('all')}
                            >
                                전체
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`${styles.chip} ${selectedCatId === c.id ? styles.chipActive : ''}`}
                                    onClick={() => setSelectedCatId(c.id)}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>

                        <div className={styles.searchBox}>
                            <input
                                className={styles.searchInput}
                                placeholder="검색: 궁금한 내용을 입력하세요"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className={styles.errorBox}>{error}</div>}

                    <div className={styles.faqCard}>
                        <div className={styles.faqHeaderRow}>
                            <span className={styles.faqHeaderLabel}>FAQ</span>
                            <span className={styles.faqHeaderSub}>
                                {selectedCatName} · {filteredFaqs.length}개
                            </span>
                        </div>

                        {loading ? (
                            <div className={styles.faqEmpty}>불러오는 중...</div>
                        ) : filteredFaqs.length === 0 ? (
                            <div className={styles.faqEmpty}>
                                해당 조건에 맞는 FAQ가 없습니다. 다른 키워드나 카테고리로 검색해보세요.
                            </div>
                        ) : (
                            <ul className={styles.faqList}>
                                {filteredFaqs.map((f) => {
                                    const isOpen = expandedId === f.id
                                    return (
                                        <li key={f.id} className={styles.faqItem}>
                                            <button
                                                type="button"
                                                className={`${styles.faqQuestionRow} ${
                                                    isOpen ? styles.faqQuestionOpen : ''
                                                }`}
                                                onClick={() => toggleExpand(f.id)}
                                            >
                                                <span className={styles.faqCategoryBadge}>{f.categoryName}</span>
                                                <span className={styles.faqQuestionText}>{f.question}</span>
                                                <span className={styles.faqToggleIcon}>{isOpen ? '−' : '+'}</span>
                                            </button>
                                            {isOpen && (
                                                <div className={styles.faqAnswer}>
                                                    {/* HTML이 아니라고 가정하고 텍스트만 출력 */}
                                                    {f.answer.split('\n').map((line, idx) => (
                                                        <p key={idx} className={styles.faqAnswerLine}>
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                </section>

                {/* 오른쪽 : 1:1 문의 박스 */}
                <aside className={styles.right}>
                    <div className={styles.helpCard}>
                        <h2 className={styles.helpTitle}>1:1 문의하기</h2>
                        <p className={styles.helpDesc}>
                            FAQ로 해결되지 않는 문제가 있다면,
                            <br />
                            언제든지 1:1 문의를 남겨주세요.
                        </p>

                        <ul className={styles.helpList}>
                            <li>예약 / 취소 / 환불 관련 문의</li>
                            <li>결제 오류 및 영수증 관련 문의</li>
                            <li>계정 및 로그인 관련 문의</li>
                            <li>기타 서비스 이용 중 불편 사항</li>
                        </ul>

                        <div className={styles.helpInfo}>
                            <span className={styles.helpInfoLabel}>응답 시간</span>
                            <span className={styles.helpInfoValue}>평일 10:00 ~ 18:00 (주말/공휴일 제외)</span>
                        </div>

                        <ClientNav />

                        <p className={styles.helpNotice}>
                            이미 남긴 문의는{' '}
                            <Link href="/mypage?tab=qna" className={styles.helpInlineLink}>
                                마이페이지 &gt; 문의 내역
                            </Link>{' '}
                            에서 확인하실 수 있습니다.
                        </p>
                    </div>

                    <div className={styles.tipCard}>
                        <h3 className={styles.tipTitle}>빠른 답변을 위한 꿀팁</h3>
                        <ul className={styles.tipList}>
                            <li>문의하실 상품 / 주문 번호를 함께 적어주세요.</li>
                            <li>발생한 화면 캡처나 구체적인 상황을 남겨주시면 더 빨리 도와드릴 수 있어요.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </main>
    )
}
