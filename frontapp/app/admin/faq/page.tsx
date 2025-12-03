'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import api from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'
import Sidebar from '@/app/admin/components/Sidebar'
import Modal from '@/app/admin/components/Modal'

type Id = string

export type FaqCategoryRes = {
    id: Id
    name: string
    slug: string
    orderNo: number
    active: boolean
    createdAt?: string
    updatedAt?: string
}

export type FaqRes = {
    id: Id
    categoryId: Id
    categoryName: string
    categorySlug: string
    question: string
    answer: string
    orderNo: number
    published: boolean
    createdAt?: string
    updatedAt?: string
}

export default function AdminFaqPage() {
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string | null>(null)

    const [categories, setCategories] = useState<FaqCategoryRes[]>([])
    const [selectedCatId, setSelectedCatId] = useState<Id | 'all'>('all')

    const [rows, setRows] = useState<FaqRes[]>([])
    const [q, setQ] = useState('')

    // 인라인 슬라이드 수정용
    const [expandedId, setExpandedId] = useState<Id | null>(null)
    const [inlineEditingRow, setInlineEditingRow] = useState<Partial<FaqRes> | null>(null)

    // FAQ 추가 모달용
    const [newFaq, setNewFaq] = useState<Partial<FaqRes> | null>(null)

    // 카테고리 관리/에디터
    const [catManagerOpen, setCatManagerOpen] = useState(false)
    const [editingCat, setEditingCat] = useState<Partial<FaqCategoryRes> | null>(null)

    // -------- Axios-safe 래퍼 --------
    async function safe<T>(p: Promise<{ data: any }>, fallbackMsg: string): Promise<T> {
        try {
            const { data } = await p
            return data as T
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || fallbackMsg
            throw new Error(msg)
        }
    }

    // -------- 로더 --------
    async function loadCategories() {
        const data = await safe<{ content?: FaqCategoryRes[] } | FaqCategoryRes[]>(
            api.get('/admin/faq/categories', {
                params: { page: 0, size: 100, sort: 'orderNo,asc' },
                withCredentials: true,
            }),
            '카테고리 로드 실패',
        )
        const list = Array.isArray(data) ? data : data.content ?? []
        setCategories(list)
    }

    async function loadFaqs() {
        const params: any = { page: 0, size: 100 }
        if (selectedCatId !== 'all') params.categoryId = String(selectedCatId)
        if (q.trim()) params.q = q.trim()

        const data = await safe<{ content?: FaqRes[] } | FaqRes[]>(
            api.get('/admin/faq', { params, withCredentials: true }),
            'FAQ 로드 실패',
        )
        const list = Array.isArray(data) ? data : data.content ?? []
        setRows(list)
    }

    async function loadAll() {
        setErr(null)
        setLoading(true)
        try {
            await loadCategories()
            await loadFaqs()
        } catch (e: any) {
            setErr(e?.message ?? '로드 실패')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [])

    useEffect(() => {
        if (!loading) {
            loadFaqs().catch((e) => setErr(e?.message ?? '로드 실패'))
        }
    }, [selectedCatId, q])

    const selectedCat = useMemo(() => categories.find((c) => c.id === selectedCatId), [categories, selectedCatId])

    // -------- 액션 (FAQ) --------
    async function onSaveFaq(form: Partial<FaqRes>) {
        const payload = {
            categoryId: form.categoryId,
            question: form.question,
            answer: form.answer,
            orderNo: Number(form.orderNo ?? 0),
            published: Boolean(form.published ?? true),
        }
        if (form.id) {
            await safe(
                api.patch(`/admin/faq/${form.id}`, payload, {
                    withCredentials: true,
                }),
                'FAQ 수정 실패',
            )
        } else {
            await safe(api.post(`/admin/faq`, payload, { withCredentials: true }), 'FAQ 생성 실패')
        }
        await loadFaqs()

        // 슬라이드/모달 공통 초기화
        setExpandedId(null)
        setInlineEditingRow(null)
        setNewFaq(null)
    }

    async function onDeleteFaq(id: Id) {
        if (!confirm('이 FAQ를 삭제할까요?')) return
        await safe(api.delete(`/admin/faq/${id}`, { withCredentials: true }), 'FAQ 삭제 실패')
        await loadFaqs()
        if (expandedId === id) {
            setExpandedId(null)
            setInlineEditingRow(null)
        }
    }

    async function onTogglePublish(row: FaqRes) {
        await safe(
            api.patch(`/admin/faq/${row.id}/publish`, null, {
                params: { value: !row.published },
                withCredentials: true,
            }),
            '공개 상태 변경 실패',
        )
        await loadFaqs()
    }

    // -------- 액션 (카테고리) --------
    async function onSaveCategory(c: Partial<FaqCategoryRes>) {
        const payload = {
            name: c.name,
            slug: c.slug,
            orderNo: Number(c.orderNo ?? 0),
            active: Boolean(c.active ?? true),
        }
        if (c.id) {
            await safe(
                api.patch(`/admin/faq/categories/${c.id}`, payload, {
                    withCredentials: true,
                }),
                '카테고리 수정 실패',
            )
        } else {
            await safe(
                api.post(`/admin/faq/categories`, payload, {
                    withCredentials: true,
                }),
                '카테고리 생성 실패',
            )
        }
        await loadCategories()
        setEditingCat(null)
    }

    async function onDeleteCategory(id: Id) {
        if (!confirm('이 카테고리를 삭제할까요? (소속 FAQ가 있다면 이전 후 삭제 권장)')) return
        try {
            await api.delete(`/admin/faq/categories/${id}`, {
                withCredentials: true,
            })
            await loadCategories()
            setSelectedCatId((prev) => (prev === id ? 'all' : prev))
        } catch (e: any) {
            alert(e?.response?.data?.message || e?.message || '카테고리 삭제 실패')
        }
    }

    // -------- 인라인 편집 헬퍼 --------
    const toggleRow = (row: FaqRes) => {
        if (expandedId === row.id) {
            setExpandedId(null)
            setInlineEditingRow(null)
        } else {
            setExpandedId(row.id)
            setInlineEditingRow({ ...row })
        }
    }

    const updateInlineEditingRow = (patch: Partial<FaqRes>) => {
        setInlineEditingRow((prev) => ({ ...(prev || {}), ...patch }))
    }

    const openNewFaqModal = () => {
        if (categories.length === 0) return
        setNewFaq({
            id: undefined,
            categoryId: selectedCat?.id ?? categories[0].id,
            question: '',
            answer: '',
            orderNo: 0,
            published: true,
        })
    }

    return (
        <section className={styles.page}>
            <Sidebar />
            <div className={styles.main}>
                <header className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>FAQ 관리</h1>
                        <p className={styles.pageSubtitle}>카테고리와 FAQ를 추가/수정/삭제할 수 있습니다.</p>
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.searchBox}>
                            <input
                                className={styles.searchInput}
                                placeholder="검색: 질문/답변"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>

                        <button className={styles.btn} onClick={() => setCatManagerOpen(true)}>
                            카테고리 관리
                        </button>
                        <button
                            className={styles.btn}
                            onClick={openNewFaqModal}
                            disabled={categories.length === 0}
                            title={categories.length === 0 ? '먼저 카테고리를 추가하세요' : ''}
                        >
                            FAQ 추가
                        </button>

                        <select
                            className={styles.select}
                            value={selectedCatId}
                            onChange={(e) => setSelectedCatId(e.target.value as any)}
                        >
                            <option value="all">전체</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.active ? '' : '[비활성] '}
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                {err && <div className={styles.errorBox}>{err}</div>}
                <section className={styles.card}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.colCategory}>카테고리</th>
                                    <th className={styles.colQuestion}>질문</th>
                                    <th className={styles.colQuestion}>상세 내용</th>
                                    <th className={styles.colQuestion}>삭제</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className={styles.tableLoadingCell} colSpan={5}>
                                            로딩 중…
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td className={styles.tableEmptyCell} colSpan={5}>
                                            항목이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((r) => {
                                        const isOpen =
                                            expandedId === r.id && inlineEditingRow && inlineEditingRow.id === r.id

                                        return (
                                            <Fragment key={r.id}>
                                                {/* 클릭해서 여는 메인 행 */}
                                                <tr
                                                    className={`${styles.tableRow} ${styles.tableRowClickable}`}
                                                    onClick={() => toggleRow(r)}
                                                >
                                                    <td className={styles.cellCategory}>{r.categoryName}</td>
                                                    <td className={styles.cellQuestion}>
                                                        <div className={styles.questionText}>{r.question}</div>
                                                    </td>

                                                    <td className={styles.cellAnswer}>
                                                        <div className={styles.answerText}>{r.answer}</div>
                                                    </td>

                                                    <td className={styles.cellActions}>
                                                        <button
                                                            className={`${styles.btn} ${styles.actionDanger}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onDeleteFaq(r.id)
                                                            }}
                                                        >
                                                            삭제
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* 슬라이드 인라인 에디터 행 */}
                                                <tr className={styles.detailRow}>
                                                    <td colSpan={5} className={styles.detailCell}>
                                                        <div
                                                            className={`${styles.slidePanel} ${
                                                                isOpen ? styles.slidePanelOpen : ''
                                                            }`}
                                                        >
                                                            {isOpen && inlineEditingRow && (
                                                                <div className={styles.slidePanelInner}>
                                                                    <InlineFaqEditor
                                                                        categories={categories}
                                                                        form={inlineEditingRow}
                                                                        onChange={updateInlineEditingRow}
                                                                        onCancel={() => {
                                                                            setExpandedId(null)
                                                                            setInlineEditingRow(null)
                                                                        }}
                                                                        onSave={() => onSaveFaq(inlineEditingRow)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </Fragment>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* 카테고리 관리 모달 (공용 Modal 사용) */}
            <Modal open={catManagerOpen} onClose={() => setCatManagerOpen(false)} title="카테고리 관리" size="md">
                <CategoryManagerPanel
                    categories={categories}
                    onClose={() => setCatManagerOpen(false)}
                    onEdit={(c) => setEditingCat(c || {})}
                    onDelete={onDeleteCategory}
                />
            </Modal>

            {/* 카테고리 추가/수정 모달 */}
            <Modal
                open={!!editingCat}
                onClose={() => setEditingCat(null)}
                title={editingCat?.id ? '카테고리 수정' : '카테고리 추가'}
                size="sm"
            >
                {editingCat && (
                    <CategoryEditor value={editingCat} onClose={() => setEditingCat(null)} onSave={onSaveCategory} />
                )}
            </Modal>

            {/* FAQ 추가 모달 */}
            <Modal open={!!newFaq} onClose={() => setNewFaq(null)} title="FAQ 추가" size="lg">
                {newFaq && (
                    <FaqEditor
                        categories={categories}
                        value={newFaq}
                        onClose={() => setNewFaq(null)}
                        onSave={onSaveFaq}
                    />
                )}
            </Modal>
        </section>
    )
}

/* =================== 카테고리 관리 패널 (Modal 안 내용) =================== */
function CategoryManagerPanel({
    categories,
    onClose,
    onEdit,
    onDelete,
}: {
    categories: FaqCategoryRes[]
    onClose: () => void
    onEdit: (c?: Partial<FaqCategoryRes>) => void
    onDelete: (id: Id) => Promise<void>
}) {
    return (
        <div className={styles.modalBodyScrollable}>
            <div className={styles.modalHeaderRow}>
                <button className={styles.buttonSecondarySmall} onClick={() => onEdit({})} title="카테고리 추가">
                    + 추가
                </button>
                <button className={styles.modalCloseButton} onClick={onClose}>
                    닫기
                </button>
            </div>
            <table className={styles.table}>
                <thead className={styles.tableHead}>
                    <tr>
                        <th className={styles.colCatName}>이름</th>
                        <th className={styles.colCatSlug}>슬러그</th>
                        <th className={styles.colCatStatus}>상태</th>
                        <th className={styles.colActions}>작업</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length === 0 ? (
                        <tr>
                            <td className={styles.tableEmptyCell} colSpan={5}>
                                등록된 카테고리가 없습니다. “+ 추가”를 눌러 생성하세요.
                            </td>
                        </tr>
                    ) : (
                        categories.map((c) => (
                            <tr key={c.id} className={styles.tableRow}>
                                <td className={styles.cellCategoryManagerName}>
                                    <div className={styles.categoryNameText}>{c.name}</div>
                                </td>
                                <td className={styles.cellCategorySlug}>{c.slug}</td>
                                <td className={styles.cellStatus}>
                                    <span
                                        className={`${styles.categoryStatus} ${
                                            c.active ? styles.categoryStatusActive : styles.categoryStatusInactive
                                        }`}
                                    >
                                        {c.active ? '활성' : '비활성'}
                                    </span>
                                </td>
                                <td className={styles.cellActions}>
                                    <button className={styles.buttonSecondarySmall} onClick={() => onEdit(c)}>
                                        수정
                                    </button>
                                    <button
                                        className={`${styles.modalCloseButton} ${styles.actionDanger}`}
                                        onClick={() => onDelete(c.id)}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

/* =================== 카테고리 추가/수정 폼 =================== */
function CategoryEditor({
    value,
    onClose,
    onSave,
}: {
    value: Partial<FaqCategoryRes>
    onClose: () => void
    onSave: (form: Partial<FaqCategoryRes>) => Promise<void>
}) {
    const [form, setForm] = useState<Partial<FaqCategoryRes>>({
        id: value.id,
        name: value.name ?? '',
        slug: value.slug ?? '',
        orderNo: value.orderNo ?? 0,
        active: value.active ?? true,
    })

    const save = async () => {
        if (!form.name?.trim()) {
            alert('이름을 입력하세요')
            return
        }
        if (!form.slug?.trim()) {
            alert('슬러그를 입력하세요 (소문자/숫자/하이픈)')
            return
        }
        await onSave(form)
    }

    return (
        <div className={styles.categoryPlusForm}>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>이름</label>
                <input
                    className={styles.inputText}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="예: 결제"
                />
            </div>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>슬러그</label>
                <input
                    className={styles.inputText}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="예: payment"
                />
            </div>

            <div className={styles.modalFooter}>
                <button className={styles.buttonSecondarySmall} onClick={onClose}>
                    취소
                </button>
                <button className={styles.buttonSecondarySmall} onClick={save}>
                    저장
                </button>
            </div>
        </div>
    )
}

/* =================== FAQ 추가/수정 폼 (모달용) =================== */
function FaqEditor({
    categories,
    value,
    onClose,
    onSave,
}: {
    categories: FaqCategoryRes[]
    value: Partial<FaqRes>
    onClose: () => void
    onSave: (form: Partial<FaqRes>) => Promise<void>
}) {
    const [form, setForm] = useState<Partial<FaqRes>>({
        id: value.id,
        categoryId: value.categoryId ?? categories[0]?.id,
        question: value.question ?? '',
        answer: value.answer ?? '',
        orderNo: value.orderNo ?? 0,
        published: value.published ?? true,
    })

    const save = async () => {
        if (!form.categoryId) {
            alert('카테고리를 선택하세요')
            return
        }
        if (!form.question?.trim()) {
            alert('질문을 입력하세요')
            return
        }
        if (!form.answer?.trim()) {
            alert('답변을 입력하세요')
            return
        }
        await onSave(form)
    }

    return (
        <div className={styles.faqPlusForm}>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>카테고리</label>
                <select
                    className={styles.select}
                    value={form.categoryId as string}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>질문</label>
                <input
                    className={styles.inputText}
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    placeholder="질문을 입력하세요"
                />
            </div>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>답변</label>
                <textarea
                    className={styles.inputText}
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    placeholder="답변을 입력하세요"
                />
            </div>

            <div className={styles.modalFooter}>
                <button className={styles.buttonSecondarySmall} onClick={onClose}>
                    취소
                </button>
                <button className={styles.buttonSecondarySmall} onClick={save}>
                    저장
                </button>
            </div>
        </div>
    )
}

/* =================== 인라인 FAQ 에디터 (슬라이드용) =================== */
function InlineFaqEditor({
    categories,
    form,
    onChange,
    onSave,
    onCancel,
}: {
    categories: FaqCategoryRes[]
    form: Partial<FaqRes>
    onChange: (patch: Partial<FaqRes>) => void
    onSave: () => void
    onCancel: () => void
}) {
    const handleSave = () => {
        if (!form.categoryId) {
            alert('카테고리를 선택하세요')
            return
        }
        if (!form.question?.trim()) {
            alert('질문을 입력하세요')
            return
        }
        if (!form.answer?.trim()) {
            alert('답변을 입력하세요')
            return
        }
        onSave()
    }

    return (
        <div className={styles.formGrid}>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>카테고리</label>
                <select
                    className={styles.select}
                    value={form.categoryId as string}
                    onChange={(e) => onChange({ categoryId: e.target.value })}
                >
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>질문</label>
                <input
                    className={styles.inputText}
                    value={form.question ?? ''}
                    onChange={(e) => onChange({ question: e.target.value })}
                    placeholder="질문을 입력하세요"
                />
            </div>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>답변</label>
                <textarea
                    className={styles.textarea}
                    value={form.answer ?? ''}
                    onChange={(e) => onChange({ answer: e.target.value })}
                    placeholder="답변을 입력하세요"
                />
            </div>

            <div className={styles.modalFooter}>
                <button className={styles.buttonSecondary} onClick={onCancel}>
                    취소
                </button>
                <button className={styles.buttonPrimary} onClick={handleSave}>
                    저장
                </button>
            </div>
        </div>
    )
}
