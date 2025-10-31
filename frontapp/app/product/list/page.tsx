'use client'

import { useRef } from 'react'
import { useEffect, useState } from 'react'
import api from '@/app/utils/api'
import styles from './Cards.module.css'

// 타입 정의 (백엔드 DTO 구조에 맞춰 수정 가능)
type Category = {
    id: number
    name: string
}

type Product = {
    id: number
    name: string
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
//

export default function Product() {
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
    const didMount = useRef(false)
    const onClickCategory = (id: number) => {
        setSelectedCatId(id) // 클릭한 카테고리의 id를 상태에 저장
    }
    const onClickSubCategory = (id: number) => {
        setSelectedSubCatId(id) // 클릭한 서브카테고리의 id를 상태에 저장
        setSelectedBtn({}) // ✅ 선택 초기화 (선택)
    }
    //

    const handleImmediateSubmit = () => {
        // 입력 반영 직후 FormData가 맞게 잡히도록 다음 프레임에 실행
        requestAnimationFrame(() => submitFilter())
    }
    const handleFilterClick = (code: string, label: string) => {
        setSelectedBtn((prev) => {
            const nextValue = prev[code] === label ? null : label
            return { ...prev, [code]: nextValue }
        })
    }

    /** 선택 상태 -> extra(flat) 변환 (싱글이므로 string 또는 미포함) */
    const buildExtra = (state: Record<string, string | null>) => {
        const extra: Record<string, string> = {}
        for (const [k, v] of Object.entries(state)) {
            if (v != null) extra[k] = v
        }
        return extra
    }
    // const [selectedMin, setSelectedMin] = useState<number | null>(null)
    // const [selectedMax, setSelectedMax] = useState<number | null>(null)

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
    useEffect(() => {
        if (selectedCategoryId == null) return
        ;(async () => {
            try {
                // 백엔드: GET /api/v1/filter/{id}/Group
                const { data } = await api.get(`filter/${selectedCategoryId}/group`)
                const groupsData = data.data.filterGroupList

                // 2️⃣ 각 그룹별 옵션 요청을 병렬 처리
                const optionPromises = groupsData.map((g) => api.get(`filter/${g.id}/option`))

                const results = await Promise.all(optionPromises)

                // 3️⃣ 그룹별 ID를 키로 한 맵 형태로 변환
                const optionMap: Record<number, FilterOptionDto[]> = {}
                results.forEach((res, idx) => {
                    const groupId = groupsData[idx].id
                    const options: FilterOptionDto[] = res.data.data.filterOptionList ?? []
                    optionMap[groupId] = options
                })
                setFilterGroups(groupsData)
                setFilterOptions(optionMap)
            } catch (error) {
                console.error('필터그룹 조회 실패:', error)
            }
        })()
    }, [selectedCategoryId])

    useEffect(() => {
        if (selectedSubCategoryId == null) return
        ;(async () => {
            try {
                // 백엔드: GET /api/v1/product/{id}
                const { data } = await api.get(`product/${selectedSubCategoryId}`)
                const productList = data.data.productList

                setProducts(productList)
            } catch (error) {
                console.error('상품목록 조회 실패:', error)
            }
        })()
    }, [selectedSubCategoryId])

    const submitFilter = (extra?: Record<string, string>) => {
        if (selectedSubCategoryId == null) return
        const form = document.getElementById('filterForm') as HTMLFormElement | null
        if (!form) return
        // 폼의 현재 값 수집

        const fd = new FormData(form)

        // 색선택 버튼에서 온 추가 pair 병합
        if (extra) {
            for (const [k, v] of Object.entries(extra)) fd.append(k, v)
        }

        // checkbox/radio의 다중값까지 포함하려면 getAll 사용
        const payload: Record<string, string | string[]> = {}
        for (const [k] of fd.entries()) {
            const all = fd.getAll(k).map(String)
            payload[k] = all.length > 1 ? all : all[0] // 단일/다중 자동 처리
        }

        api.get(`product/${selectedCategoryId}/search`, { params: payload }).then((res) => {
            if (!res.data?.data?.productFilterList) {
                console.warn('응답 데이터 구조 이상')
                console.log(res.data.data.productFilterList)
                return
            }
            console.log(res.data.data.productFilterList)
            setItems(res.data.data.productFilterList)
        })
        // .catch((err) => {
        //     console.error('상품 검색 실패:', err.response?.data ?? err.message)
        //     alert('검색 요청에 실패했습니다. 잠시 후 다시 시도해주세요.')
        // })
    }

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        const extra = buildExtra(selectedBtn)
        submitFilter(extra)
    }, [selectedBtn, selectedSubCategoryId])

    return (
        <>
            <nav className="category-tree" aria-label="카테고리 메뉴">
                <h2>카테고리</h2>
                {categories.map((cat) => (
                    <ul className="category-list" key={cat.id}>
                        <li className="category-item">
                            <button className="category-toggle" aria-expanded="false">
                                {cat.name} <span className="icon">+</span>
                            </button>
                            <ul className="subcategory-list">
                                {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                                    <li key={sub.id}>
                                        <a
                                            onClick={() => {
                                                onClickCategory(cat.id)
                                                onClickSubCategory(sub.id)
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

            {/*  */}
            <section aria-labelledby="filter-heading" className="filter-area">
                <form id="filterForm" method="get" className="filter-form" action=""></form>
                <h2 id="filter-heading" className="text-lg font-semibold mb-3">
                    필터 영역
                </h2>

                {filterGroups.length == 0 ? (
                    <p className="text-sm text-gray-500">표시할 필터그룹이 없습니다.</p>
                ) : (
                    <ul className="space-y-2">
                        {filterGroups.map((g) => (
                            <li key={g.id} className="rounded border px-3 py-2 flex items-center justify-between">
                                <div className="font-medium truncate">{g.name}</div>
                                <div className="min-w-0">
                                    {/* 옵션 목록 */}

                                    <ul className="flex flex-wrap gap-2">
                                        {(filterOptions[g.id] ?? []).length > 0 ? (
                                            filterOptions[g.id].map((o) => (
                                                <li
                                                    key={o.id}
                                                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 cursor-pointer"
                                                >
                                                    {o.label && <label>{o.label}</label>}
                                                    {/* type을 submit이라고 썼지만 컬러값버튼임.. 수정해야함! */}
                                                    {o.inputType === 'submit' ? (
                                                        <>
                                                            <button
                                                                form="filterForm"
                                                                name={`${o.filterCode}`}
                                                                value={o.label}
                                                                type="button"
                                                                onClick={() => handleFilterClick(o.filterCode, o.label)}
                                                                aria-pressed={selectedBtn[o.filterCode] === o.label}
                                                                className={`${styles.chip} ${
                                                                    selectedBtn[o.filterCode] === o.label
                                                                        ? styles.active
                                                                        : ''
                                                                }`}
                                                                style={{
                                                                    backgroundColor: o.colorHex,
                                                                }}
                                                            />
                                                        </>
                                                    ) : o.inputType === 'CHIP' ? (
                                                        <>
                                                            {/* CHIP: 3만원 이하 */}
                                                            <button
                                                                form="filterForm"
                                                                name="PRICE_MIN"
                                                                type="button"
                                                                onClick={() => handleFilterClick('PRICE_MIN', '30000')}
                                                                aria-pressed={selectedBtn['PRICE_MIN'] === '30000'}
                                                                className={`${styles.prChip} ${
                                                                    selectedBtn['PRICE_MIN'] === '30000'
                                                                        ? styles.active
                                                                        : ''
                                                                }`}
                                                            >
                                                                3만원 이하
                                                            </button>

                                                            {/* CHIP: 3만원 이상 */}
                                                            <button
                                                                form="filterForm"
                                                                name="PRICE_MAX"
                                                                type="button"
                                                                onClick={() => handleFilterClick('PRICE_MAX', '30000')}
                                                                aria-pressed={selectedBtn['PRICE_MAX'] === '30000'}
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
                                                            <input
                                                                form="filterForm"
                                                                onChange={handleImmediateSubmit} // ✅ 변경 즉시 submit
                                                                type={o.inputType}
                                                                name={o.filterCode}
                                                                value={o.label}
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

            <section aria-labelledby="cards-title">
                <h2 id="cards-title">카드섹션</h2>
                {products.length == 0 ? (
                    <p className="text-sm text-gray-500">표시할 상품목록이 없습니다.</p>
                ) : (
                    <ul className={styles.cardGrid} role="list">
                        {products.map((p) => (
                            <li className={styles.card} key={p.id}>
                                <article>
                                    <a href="#" className={styles.cardLink} aria-label="카드 1 자세히 보기">
                                        <figure className={styles.cardMedia}>
                                            <img alt="카드 1 대표 이미지" loading="lazy" />
                                        </figure>
                                        <h3 className={styles.cardTitle}>{p.name}</h3>
                                        <p className={styles.cardDesc}>간단한 설명 문구가 들어갑니다.</p>
                                    </a>
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

            <section aria-labelledby="cards-title">
                <h2 id="cards-title">카드섹션2</h2>
                {items.length == 0 ? (
                    <p className="text-sm text-gray-500">표시할 상품목록이 없습니다.</p>
                ) : (
                    <ul className={styles.cardGrid} role="list">
                        {items.map((p) => (
                            <li className={styles.card} key={p.id}>
                                <article>
                                    <a href="#" className={styles.cardLink} aria-label="카드 1 자세히 보기">
                                        <figure className={styles.cardMedia}></figure>
                                        <h3 className={styles.cardTitle}>{p.name}</h3>
                                        <p className={styles.cardDesc}>간단한 설명 문구가 들어갑니다.</p>
                                    </a>
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
        </>
    )
}

// {inputData.inputType === "radio" && (
//   <input type="radio" name="optionGroup" value={o.id} />
// )}
// {inputData.inputType === "checkbox" && (
//   <input type="checkbox" name="optionGroup" value={o.id} />
// )}
// {inputData.inputType === "text" && <input type="text" placeholder={o.label} />}
