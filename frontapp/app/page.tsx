'use client'

import api from '@/app/utils/api'
import { useEffect, useState } from 'react'
import styles from './main.module.css'
import Link from 'next/link'

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

export default function Main() {
    const [categories, setCategories] = useState<Category[]>([])
    const [subCategoriesByCat, setSubCategoriesByCat] = useState<Record<number, SubCategory[]>>({})

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async (): Promise<void> => {
        try {
            // 1 카테고리 목록 먼저 요청
            const res = await api.get('/category')

            // ✅ 구조 분해 (axios는 자동으로 JSON 파싱)
            const categoryList: Category[] = res.data.data.categoryList

            setCategories(categoryList)

            // 2 카테고리 ID별로 서브카테고리 병렬 요청
            const subPromises = categoryList.map(async (cat) => {
                const res = await api.get(`/category/${cat.id}/sub`)

                return [cat.id, res.data.data.subCategoryList] as const
            })

            // 3 모든 fetch 결과를 병렬로 처리
            const results = await Promise.all(subPromises)

            // 4 categoryId를 key로 하는 객체 구조로 변환
            const subMap: Record<number, SubCategory[]> = {}
            results.forEach(([catId, subs]) => {
                subMap[catId] = subs
            })

            setSubCategoriesByCat(subMap)
        } catch (err) {
            console.error('fetchAll error:', err)
        }
    }

    return (
        <main className={styles.mainPage}>
            <h1 className={styles.pageTitle}>카테고리</h1>

            <nav aria-label="카테고리 슬라이더">
                <div className={styles.slider} role="region" aria-roledescription="carousel">
                    <button type="button" className={styles.sliderPrev} aria-label="이전 카테고리">
                        &lt;
                    </button>

                    <ul className={styles.categoryList} role="list">
                        {categories.map((cat) => (
                            <li key={cat.id} className={styles.categoryItem}>
                                {/* <button type="button" className={styles.categoryBtn}>
                                    {cat.name}
                                </button> */}

                                <Link
                                    className={styles.categoryBtn}
                                    href={{
                                        pathname: '/product/list',
                                        query: { categoryId: String(cat.id), subId: '0' },
                                    }}
                                    prefetch={false}
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <button type="button" className={styles.sliderNext} aria-label="다음 카테고리">
                        &gt;
                    </button>
                </div>
            </nav>

            <header className={styles.categoryHeader}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.headerTitle}>목록별 카테고리</h2>
                    <button type="button" className={styles.menuToggle} aria-label="카테고리 메뉴 열기">
                        {/* 전역 아이콘 (Font Awesome) */}
                        <i className="fa fa-bars"></i>
                    </button>
                </div>

                <nav className={styles.headerNav} aria-label="상단 메뉴">
                    <ul className={styles.navList}>
                        <li className={styles.navItem}>
                            <a href="#">이벤트</a>
                        </li>
                        <li className={styles.navItem}>
                            <a href="#">셀러소개</a>
                        </li>
                        <li className={styles.navItem}>
                            <a href="#">문의사항</a>
                        </li>
                    </ul>
                </nav>
            </header>

            <div className={styles.categoryContainer}>
                {categories.map((cat) => (
                    <ul className={styles.categoryList2} key={cat.id}>
                        <li>
                            <strong className={styles.categoryTitle}>{cat.name}</strong>
                            <ul className={styles.subcategoryList}>
                                {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                                    <li key={sub.id}>
                                        {/* <a href="#">{sub.name}</a> */}

                                        <Link
                                            href={{
                                                pathname: '/product/list',
                                                query: { categoryId: String(cat.id), subId: String(sub.id) },
                                            }}
                                            prefetch={false}
                                        >
                                            {sub.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                ))}
            </div>
        </main>
    )
}
