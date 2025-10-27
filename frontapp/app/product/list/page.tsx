'use client'

import { useEffect, useState } from 'react'
import api from '@/app/utils/api'

// 타입 정의 (백엔드 DTO 구조에 맞춰 수정 가능)
type Category = {
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
    inputType: 'CHECKBOX' | 'RADIO' | 'CHIP'
    selectionMode: 'SINGLE' | 'MULTI'
    sortOrder: number
}
//

export default function Product() {
    const [categories, setCategories] = useState<Category[]>([])
    const [subCategoriesByCat, setSubCategoriesByCat] = useState<Record<number, SubCategory[]>>({})
    //
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    const [filterGroups, setFilterGroups] = useState<FilterGroupDto[]>([])
    // ✅ 상태 타입을 Record<number, FilterOptionDto[]> 로 변경
    const [filterOptions, setFilterOptions] = useState<Record<number, FilterOptionDto[]>>({})
    const onClickCategory = (id: number) => {
        setSelectedCategoryId(id) // 클릭한 카테고리의 id를 상태에 저장
    }
    //

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async (): Promise<void> => {
        // 1) 카테고리 목록 먼저 요청
        const { data: catRes } = await api.get('/category')
        // 백엔드 응답 구조가 { data: { categoryList: [...] } } 라고 가정
        const categoryList: Category[] = catRes.data.categoryList
        setCategories(categoryList)

        // 2) 카테고리 ID별 서브카테고리 병렬 요청
        const subPromises = categoryList.map((cat) =>
            api
                .get(`/category/${cat.id}/sub`)
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

                console.log('서버 응답:', groupsData) // ✅ 여기서 확인
                console.log('서버 응답:', optionMap) // ✅ 여기서 확인
                setFilterGroups(groupsData)
                setFilterOptions(optionMap)
            } catch (error) {
                console.error('필터그룹 조회 실패:', error)
            }
        })()
    }, [selectedCategoryId])

    return (
        <>
            <nav className="category-tree" aria-label="카테고리 메뉴">
                <h2>카테고리</h2>
                {categories.map((cat) => (
                    <ul className="category-list" key={cat.id}>
                        <li className="category-item">
                            <button
                                className="category-toggle"
                                aria-expanded="false"
                                onClick={() => onClickCategory(cat.id)}
                            >
                                {cat.name} <span className="icon">+</span>
                            </button>
                            <ul className="subcategory-list">
                                {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                                    <li key={sub.id}>
                                        <a onClick={() => onClickCategory(cat.id)}>{sub.name}</a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                ))}
            </nav>

            {/*  */}
            <section aria-labelledby="filter-heading" className="filter-area">
                <h2 id="filter-heading" className="text-lg font-semibold mb-3">
                    필터 영역
                </h2>

                {filterGroups.length === 0 ? (
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
                                                    {o.label}
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
            {/* // */}
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
