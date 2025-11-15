'use client'

import { useCallback } from 'react'
import { useRef } from 'react'
import { useEffect, useState } from 'react'
import api from '@/app/utils/api'
import styles from './Cards.module.css'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

// 타입 정의 (백엔드 DTO 구조에 맞춰 수정 가능)
type Category = {
    id: number
    name: string
}

type Product = {
    id: number
    name: string
    imageUrl: string
    summary?: string
    description?: string
    basePrice: number
    stockQuantity: number
    images?: ProductImageDto[]
}

type SubCategory = {
    id: number
    name: string
    categoryId: number
}

//
type FilterGroupDto = {
    id: number
    name: string
    code: string
    sortOrder: number
}
type FilterOptionDto = {
    id: number
    label: string
    inputType: 'CHECKBOX' | 'RADIO' | 'CHIP' | 'submit'
    selectionMode: 'SINGLE' | 'MULTI'
    filterCode: string
    sortOrder: number
    colorHex: string
}

type ProductImageDto = {
    id: number
    imageUrl: string
    imageOrder?: number
}
//

export default function Product() {
    const searchParams = useSearchParams()
    const didMount = useRef(false)

    const [items, setItems] = useState<any[]>([])
    const [products, setProducts] = useState<Product[]>([])

    const [categories, setCategories] = useState<Category[]>([])
    const [subCategoriesByCat, setSubCategoriesByCat] = useState<Record<number, SubCategory[]>>({})
    //
    const [selectedCategoryId, setSelectedCatId] = useState<number | null>(null)
    const [selectedSubCategoryId, setSelectedSubCatId] = useState<number | null>(null)

    const [filterGroups, setFilterGroups] = useState<FilterGroupDto[]>([])
    // ✅ 상태 타입을 Record<number, FilterOptionDto[]> 로 변경
    const [filterOptions, setFilterOptions] = useState<Record<number, FilterOptionDto[]>>({})
    // code별로 선택된 값 집합 관리 (예: COLOR → {베이지, 화이트})
    const [selectedBtn, setSelectedBtn] = useState<Record<string, string | null>>({})

    const MUTEX: Record<string, string[]> = {
        PRICE_MIN: ['PRICE_MAX'],
        PRICE_MAX: ['PRICE_MIN'],
    }
    const BASE_URL = 'http://localhost:8090'

    const onClickSubCategory = (catId: number, subId: number) => {
        // 2️⃣ 이전 필터·선택 상태·결과 초기화
        setSelectedBtn({}) // 선택된 필터버튼 초기화
        setFilterGroups([]) // 기존 필터 그룹 제거
        setFilterOptions({}) // 기존 필터 옵션 제거
        //setItems([]) // 필터 검색 결과 초기화
        //setProducts([]) // 서브카테고리별 기본 상품목록 초기화

        // 3️⃣ 폼 DOM 초기화 (FormData 잔여 제거)
        const form = document.getElementById('filterForm') as HTMLFormElement | null
        form?.reset()

        // 4️⃣ 새 카테고리의 공통 필터 로딩
        loadFilters(catId)

        setSelectedSubCatId(subId) // 클릭한 서브카테고리의 id를 상태에 저장
        setSelectedCatId(catId) // 클릭한 카테고리의 id를 상태에 저장
    }
    //

    const handleFilterClick = (code: string, label: string) => {
        setSelectedBtn((prev) => {
            const next = { ...prev }
            ;(MUTEX[code] ?? []).forEach((k) => (next[k] = null)) // 상대 키 해제
            next[code] = prev[code] === label ? null : label // 현재 키 토글
            return next
        })
    }
    // 선택 상태를 평탄화
    const buildExtra = (state: Record<string, string | null>) => {
        const extra: Record<string, string> = {}
        for (const [k, v] of Object.entries(state)) if (v != null) extra[k] = v
        return extra
    }

    //카테고리, 서브카테고리 초기 조회
    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async (): Promise<void> => {
        // 1) 카테고리 목록 먼저 요청
        const { data: catRes } = await api.get('category')
        // 백엔드 응답 구조가 { data: { categoryList: [...] } } 라고 가정
        const categoryList: Category[] = catRes.data.categoryList
        setCategories(categoryList)

        // 2) 카테고리 ID별 서브카테고리 병렬 요청
        const subPromises = categoryList.map((cat) =>
            api
                .get(`category/${cat.id}/sub`)
                // 응답 구조: { data: { subCategoryList: [...] } }
                .then(({ data }) => [cat.id, data.data.subCategoryList] as const),
        )

        // 3) 병렬 처리
        const results = await Promise.all(subPromises)

        // 4) categoryId -> SubCategory[] 맵으로 변환
        const subMap: Record<number, SubCategory[]> = Object.fromEntries(results)
        setSubCategoriesByCat(subMap)
    }

    const loadFilters = async (categoryId: number) => {
        try {
            const { data } = await api.get(`filter/${categoryId}/group`)
            const groups: FilterGroupDto[] = data.data.filterGroupList ?? []

            const optionPromises = groups.map((g) => api.get(`filter/${g.id}/option`))
            const results = await Promise.all(optionPromises)

            const optionMap: Record<number, FilterOptionDto[]> = {}
            results.forEach((res, idx) => {
                const gid = groups[idx].id
                optionMap[gid] = res.data.data.filterOptionList ?? []
            })

            setFilterGroups(groups)
            setFilterOptions(optionMap)
        } catch (e) {
            console.error('필터그룹 조회 실패:', e)
        }
    }
    const submitFilter = useCallback(
        (extra?: Record<string, string>) => {
            if (selectedCategoryId == null || selectedSubCategoryId == null) return

            const form = document.getElementById('filterForm') as HTMLFormElement | null
            if (!form) return

            // 1) 폼값 읽기
            const fd = new FormData(form)

            // 2) extra는 교체 모드로 병합 (기존 동일 키는 삭제)
            if (extra) {
                for (const [k, v] of Object.entries(extra)) {
                    fd.delete(k) // ✅ 기존 값 제거
                    if (v != null) fd.append(k, v)
                }
            }

            // 3) FormData -> payload (키 정규화 + 배열 dedup)
            const keys = new Set<string>()
            for (const [k] of fd.entries()) keys.add(k)

            const payload: Record<string, string | string[]> = {}

            keys.forEach((rawKey) => {
                // [] 접미사 제거해 서버가 기대하는 키로 통일
                const key = rawKey.endsWith('[]') ? rawKey.slice(0, -2) : rawKey

                const all = fd.getAll(rawKey).map(String)
                // 중복 제거
                const unique = Array.from(new Set(all))

                // 값이 여러 개인 경우만 배열, 아니면 단일 문자열
                payload[key] = unique.length > 1 ? unique : unique[0]
            })

            // 4) 항상 범위 파라미터 포함
            payload.categoryId = String(selectedCategoryId)
            payload.subCategoryId = String(selectedSubCategoryId)

            api.get(`product/${selectedSubCategoryId}/search`, { params: payload })
                .then((res) => {
                    const { productFilterList, imageMapList } = res.data.data

                    const merged = productFilterList.map((p: any) => {
                        const images =
                            imageMapList?.[p.id]?.map((img: any) => ({
                                ...img,
                                // ❗ 여기가 핵심: 절대경로 보정
                                imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${BASE_URL}${img.imageUrl}`,
                            })) ?? []

                        return {
                            ...p,
                            images,
                        }
                    })
                    console.log(merged)
                    setProducts(merged)
                })
                .catch((err) => console.error('상품 검색 실패:', err))
        },
        [selectedCategoryId, selectedSubCategoryId],
    )

    // ✅ 파라미터에서 categoryId, subId 받아서 상태로 설정
    useEffect(() => {
        const catIdStr = searchParams.get('categoryId')
        const subIdStr = searchParams.get('subId') ?? '0'
        if (!catIdStr) return

        const catId = Number(catIdStr)
        const subId = Number(subIdStr)

        if (!Number.isFinite(catId) || catId <= 0) return

        // subId가 0이면 API에서 최소값 조회
        if (subId === 0) {
            api.get(`category/${catId}/min`)
                .then((res) => {
                    const minSubId = res.data?.data

                    onClickSubCategory(catId, minSubId)
                })
                .catch((err) => {
                    console.error(' sub-min 값 검색 실패:', err)
                })
        }

        // subId가 0이 아니면 그대로 사용
        else {
            onClickSubCategory(catId, subId)
        }
    }, [searchParams])

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        if (selectedCategoryId == null || selectedSubCategoryId == null) return

        const extra = buildExtra(selectedBtn)
        submitFilter(extra)
    }, [selectedBtn, selectedCategoryId, selectedSubCategoryId, submitFilter])

    return (
        <div className={styles.pageFrame}>
            <div className={styles.grid}>
                {/* 왼쪽: 카테고리 사이드바 */}
                <nav className={styles.categoryTree} aria-label="카테고리 메뉴">
                    <h2>카테고리</h2>
                    {categories.map((cat) => (
                        <ul className={`${styles.categoryList} mb-3`} key={cat.id}>
                            <li className={styles.categoryItem}>
                                <button className={styles.categoryToggle} aria-expanded="false">
                                    {cat.name} <span className={styles.icon}>+</span>
                                </button>

                                <ul className={styles.subcategoryList}>
                                    {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                                        <li key={sub.id}>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    onClickSubCategory(cat.id, sub.id)
                                                }}
                                            >
                                                {sub.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    ))}
                </nav>

                {/* 오른쪽 컬럼 */}
                <div className={styles.contentColumn}>
                    {/* 필터 영역 */}
                    <section aria-labelledby="filter-heading" className={styles.filterArea}>
                        <form id="filterForm" method="get" className={styles.filterForm} action=""></form>

                        <h2 id="filter-heading" className="text-lg font-semibold mb-3">
                            필터 영역
                        </h2>

                        {filterGroups.length === 0 ? (
                            <p className="text-sm text-gray-500">표시할 필터그룹이 없습니다.</p>
                        ) : (
                            <ul className={styles.filterGroups}>
                                {filterGroups.map((g) => (
                                    <li key={g.id} className={styles.filterGroup}>
                                        <div className={styles.groupTitle}>{g.name}</div>
                                        <div>
                                            <ul className={styles.optionList}>
                                                {(filterOptions[g.id] ?? []).length > 0 ? (
                                                    filterOptions[g.id].map((o) => (
                                                        <li key={o.id} className={styles.optLabel}>
                                                            {o.label && <label>{o.label}</label>}

                                                            {o.inputType === 'submit' ? (
                                                                <>
                                                                    {/*색상 */}

                                                                    <button
                                                                        form="filterForm"
                                                                        name={`${o.filterCode}`}
                                                                        value={o.label}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleFilterClick(o.filterCode, o.label)
                                                                        }
                                                                        aria-pressed={
                                                                            selectedBtn[o.filterCode] === o.label
                                                                        }
                                                                        className={`${styles.chip} ${
                                                                            selectedBtn[o.filterCode] === o.label
                                                                                ? styles.active
                                                                                : ''
                                                                        }`}
                                                                        style={{ backgroundColor: o.colorHex }}
                                                                    />
                                                                </>
                                                            ) : o.inputType === 'CHIP' ? (
                                                                <>
                                                                    {/*가격대 */}
                                                                    <button
                                                                        form="filterForm"
                                                                        name="PRICE_MIN"
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleFilterClick('PRICE_MIN', '30000')
                                                                        }
                                                                        aria-pressed={
                                                                            selectedBtn['PRICE_MIN'] === '30000'
                                                                        }
                                                                        className={`${styles.prChip} ${
                                                                            selectedBtn['PRICE_MIN'] === '30000'
                                                                                ? styles.active
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        3만원 이하
                                                                    </button>

                                                                    <button
                                                                        form="filterForm"
                                                                        name="PRICE_MAX"
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleFilterClick('PRICE_MAX', '30000')
                                                                        }
                                                                        aria-pressed={
                                                                            selectedBtn['PRICE_MAX'] === '30000'
                                                                        }
                                                                        className={`${styles.prChip} ${
                                                                            selectedBtn['PRICE_MAX'] === '30000'
                                                                                ? styles.active
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        3만원 이상
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/*디자인 */}
                                                                    <input
                                                                        form="filterForm"
                                                                        type="CHECKBOX"
                                                                        name={o.filterCode}
                                                                        value={o.label ?? ''}
                                                                        checked={
                                                                            (selectedBtn[o.filterCode] ?? '') ===
                                                                            (o.label ?? '')
                                                                        }
                                                                        onChange={() => {
                                                                            // 단일 선택 토글
                                                                            setSelectedBtn(
                                                                                (
                                                                                    prev: Record<string, string | null>,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [o.filterCode]:
                                                                                        prev[o.filterCode] === o.label
                                                                                            ? null
                                                                                            : o.label!,
                                                                                }),
                                                                            )
                                                                        }}
                                                                    />
                                                                </>
                                                            )}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-xs text-gray-400">옵션 없음</li>
                                                )}
                                            </ul>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* 카드 섹션 */}
                    <section aria-labelledby="cards-title" className={styles.cardsWrap}>
                        <h2 id="cards-title">카드섹션</h2>

                        {products.length === 0 ? (
                            <p className="text-sm text-gray-500">표시할 상품목록이 없습니다.</p>
                        ) : (
                            <ul className={styles.cardGrid} role="list">
                                {products.map((p) => (
                                    <li className={styles.card} key={p.id}>
                                        <article>
                                            <Link
                                                href={{ pathname: '/product/list/detail', query: { productId: p.id } }}
                                                className={styles.cardLink}
                                                aria-label="카드 1 자세히 보기"
                                            >
                                                <figure className={styles.cardMedia}>
                                                    {p.images && p.images.length > 0 && (
                                                        <img src={p.images[0].imageUrl} alt={p.name} />
                                                    )}
                                                </figure>
                                                <h3 className={styles.cardTitle}>{p.name}</h3>
                                                <p className={styles.cardDesc}>간단한 설명 문구가 들어갑니다.</p>
                                            </Link>

                                            <footer className={styles.cardActions}>
                                                <a href="#" className={styles.btnRead}>
                                                    자세히
                                                </a>
                                            </footer>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}
