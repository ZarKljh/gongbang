'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/app/utils/api'
import styles from '@/app/admin/styles/AdminReports.module.css'
import Sidebar from '@/app/admin/components/Sidebar'

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

    const [editing, setEditing] = useState<Partial<FaqRes> | null>(null)
    const [editingCat, setEditingCat] = useState<Partial<FaqCategoryRes> | null>(null)

    // ✅ 카테고리 관리 모달 열림 상태
    const [catManagerOpen, setCatManagerOpen] = useState(false)

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
        setEditing(null)
    }

    async function onDeleteFaq(id: Id) {
        if (!confirm('이 FAQ를 삭제할까요?')) return
        await safe(api.delete(`/admin/faq/${id}`, { withCredentials: true }), 'FAQ 삭제 실패')
        await loadFaqs()
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
        // 관리 모달을 계속 열어두고 싶으면 유지
        setCatManagerOpen(true)
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

    // -------- UI --------
    return (
        <section className={styles.page}>
            {/* 사이드바 */}
            <Sidebar />
            <div className={styles.main}>
                <header className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>FAQ 관리</h1>
                        <p className={styles.pageSubtitle}>카테고리와 FAQ를 추가/수정/삭제할 수 있습니다.</p>
                    </div>

                    <div className={styles.filterGroup}>
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
                        <div className={styles.searchBox}>
                            <input
                                className={styles.searchInput}
                                placeholder="검색: 질문/답변"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') loadFaqs()
                                }}
                            />
                        </div>

                        <button className={styles.btn} onClick={() => setCatManagerOpen(true)}>
                            카테고리 관리
                        </button>
                        <button
                            className={styles.btn}
                            onClick={() => setEditing({ categoryId: selectedCat?.id })}
                            disabled={categories.length === 0}
                            title={categories.length === 0 ? '먼저 카테고리를 추가하세요' : ''}
                        >
                            FAQ 추가
                        </button>
                    </div>
                </header>

                {err && <div className={styles.errorBox}>{err}</div>}

                {/* Filters */}
                <div className={styles.filters}></div>

                {/* FAQ 테이블 */}
                <div className={styles.card}>
                    <table className={styles.table}>
                        <thead className={styles.tableWrapper}>
                            <tr>
                                <th className={styles.colCategory}>카테고리</th>
                                <th className={styles.colQuestion}>질문</th>
                                <th className={styles.colOrder}>정렬</th>
                                <th className={styles.colPublish}>공개</th>
                                <th className={styles.colActions}></th>
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
                                rows.map((r) => (
                                    <tr key={r.id} className={styles.tableRow}>
                                        <td className={styles.cellCategory}>{r.categoryName}</td>
                                        <td className={styles.cellQuestion}>
                                            <div className={styles.questionText}>{r.question}</div>
                                        </td>
                                        <td className={styles.cellOrder}>{r.orderNo}</td>
                                        <td className={styles.cellPublish}>
                                            <button
                                                className={`${styles.btn} ${
                                                    r.published ? styles.publishOn : styles.publishOff
                                                }`}
                                                onClick={() => onTogglePublish(r)}
                                            >
                                                {r.published ? '공개' : '비공개'}
                                            </button>
                                        </td>
                                        <td className={styles.cellActions}>
                                            <button className={styles.btn} onClick={() => setEditing(r)}>
                                                수정
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.actionDanger}`}
                                                onClick={() => onDeleteFaq(r.id)}
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
            </div>

            {/* 카테고리 관리 모달 */}
            <CategoryManagerModal
                open={catManagerOpen}
                onClose={() => setCatManagerOpen(false)}
                categories={categories}
                onEdit={(c) => {
                    setEditingCat(c || {})
                }}
                onDelete={onDeleteCategory}
            />

            {/* 카테고리 추가/수정 모달 */}
            {editingCat && (
                <CategoryEditor value={editingCat} onClose={() => setEditingCat(null)} onSave={onSaveCategory} />
            )}

            {/* FAQ 추가/수정 모달 */}
            {editing && (
                <FaqEditor
                    categories={categories}
                    value={editing}
                    onClose={() => setEditing(null)}
                    onSave={onSaveFaq}
                />
            )}
        </section>
    )
}

/* =================== 카테고리 관리 모달 =================== */
function CategoryManagerModal({
    open,
    onClose,
    categories,
    onEdit,
    onDelete,
}: {
    open: boolean
    onClose: () => void
    categories: FaqCategoryRes[]
    onEdit: (c?: Partial<FaqCategoryRes>) => void
    onDelete: (id: Id) => Promise<void>
}) {
    if (!open) return null
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalCategoryManager} role="dialog" aria-modal="true">
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitleSmall}>카테고리 관리</h2>
                    <div className={styles.modalHeaderRight}>
                        <button
                            className={styles.buttonSecondarySmall}
                            onClick={() => onEdit({})}
                            title="카테고리 추가"
                        >
                            + 추가
                        </button>
                        <button className={styles.iconButton} onClick={onClose} aria-label="닫기">
                            ✕
                        </button>
                    </div>
                </div>

                <div className={styles.modalBodyScrollable}>
                    <table className={styles.table}>
                        <thead className={styles.tableHead}>
                            <tr>
                                <th className={styles.colCatName}>이름</th>
                                <th className={styles.colCatSlug}>슬러그</th>
                                <th className={styles.colCatOrder}>정렬</th>
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
                                        <td className={styles.cellOrder}>{c.orderNo}</td>
                                        <td className={styles.cellStatus}>
                                            <span
                                                className={`${styles.categoryStatus} ${
                                                    c.active
                                                        ? styles.categoryStatusActive
                                                        : styles.categoryStatusInactive
                                                }`}
                                            >
                                                {c.active ? '활성' : '비활성'}
                                            </span>
                                        </td>
                                        <td className={styles.cellActions}>
                                            <button className={styles.actionButton} onClick={() => onEdit(c)}>
                                                수정
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.actionDanger}`}
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

                <div className={styles.modalFooter}>
                    <button className={styles.buttonSecondary} onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    )
}

/* =================== 카테고리 추가/수정 모달 =================== */
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
        <div className={styles.modalOverlay}>
            <div className={styles.modalCategoryEditor}>
                <h2 className={styles.modalTitle}>{form.id ? '카테고리 수정' : '카테고리 추가'}</h2>
                <div className={styles.formGrid}>
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
                    <div className={styles.formRow}>
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>정렬</label>
                            <input
                                type="number"
                                className={styles.inputNumberSmall}
                                value={form.orderNo as number}
                                onChange={(e) => setForm({ ...form, orderNo: Number(e.target.value) || 0 })}
                            />
                        </div>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={!!form.active}
                                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                            />
                            활성화
                        </label>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.buttonSecondary} onClick={onClose}>
                        취소
                    </button>
                    <button className={styles.buttonPrimary} onClick={save}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    )
}

/* =================== FAQ 추가/수정 모달 =================== */
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
        <div className={styles.modalOverlay}>
            <div className={styles.modalFaqEditor}>
                <h2 className={styles.modalTitle}>{form.id ? 'FAQ 수정' : 'FAQ 추가'}</h2>
                <div className={styles.formGrid}>
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
                            className={styles.textarea}
                            value={form.answer}
                            onChange={(e) => setForm({ ...form, answer: e.target.value })}
                            placeholder="답변을 입력하세요"
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formField}>
                            <label className={styles.fieldLabel}>정렬</label>
                            <input
                                type="number"
                                className={styles.inputNumberSmall}
                                value={form.orderNo as number}
                                onChange={(e) => setForm({ ...form, orderNo: Number(e.target.value) || 0 })}
                            />
                        </div>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={!!form.published}
                                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                            />
                            공개
                        </label>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.buttonSecondary} onClick={onClose}>
                        취소
                    </button>
                    <button className={styles.buttonPrimary} onClick={save}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    )
}
