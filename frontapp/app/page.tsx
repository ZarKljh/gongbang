'use client'

import api from '@/app/utils/api'
import { useEffect, useState } from 'react'
import styles from './main.module.css'
import Link from 'next/link'
import TopStudios from './section-topStudio'

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

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return

        const VISITED_KEY = 'main_visited'

        if (sessionStorage.getItem(VISITED_KEY)) {
            return
        }

        sessionStorage.setItem(VISITED_KEY, '1')

        api.post('/admin/metrics/visit', {
            path: '/',
            referrer: document.referrer || null,
        }).catch(() => {})
    }, [])

    return (
        <>
            {/* 배너 */}
            <div className={styles.pageContainer}>
                <div className={styles.heroBanner}>
                    <img src="http://localhost:8090/uploads/sogum.jfif" alt="메인 배너" />
                </div>
            </div>
            {/* 카테고리 */}
            <main className={styles.mainPage}>
                <p className={styles.pageTitle}></p>

                <nav aria-label="카테고리 슬라이더">
                    <div className={styles.slider} role="region" aria-roledescription="carousel">
                        <button type="button" className={styles.sliderPrev} aria-label="이전 카테고리">
                            &lt;
                        </button>

                        <ul className={styles.categoryList} role="list">
                            {categories.map((cat, index) => (
                                <li key={cat.id} className={styles.categoryItem}>
                                    <Link
                                        className={styles.categoryBtn}
                                        href={{
                                            pathname: '/product/list',
                                            query: { categoryId: String(cat.id), subId: '0' },
                                        }}
                                        prefetch={false}
                                    >
                                        <img
                                            src={`http://localhost:8090/uploads/c${String(index + 1).padStart(
                                                2,
                                                '0',
                                            )}.png`}
                                            alt={cat.name}
                                        />
                                    </Link>

                                    <p className={styles.categoryLabel}>{cat.name}</p>
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
                        <h2 className={styles.headerTitle}>세부 카테고리</h2>
                    </div>

                    {/* <nav className={styles.headerNav} aria-label="상단 메뉴">
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
                </nav> */}
                </header>

                <div className={styles.categoryContainer}>
                    {categories.map((cat) => (
                        <ul className={styles.categoryList2} key={cat.id}>
                            <li>
                                <strong className={styles.categoryTitle}>{cat.name}</strong>
                                <ul className={styles.subcategoryList}>
                                    {(subCategoriesByCat[cat.id] ?? []).map((sub) => (
                                        <li key={sub.id} className={styles.subCatTitle}>
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
            {/* 섹션 */}
            <section className={styles.recommendWrap}>
                {/* 섹션 1 — 오늘의 추천 상품 */}
                <div className={styles.sectionBox}>
                    <h2 className={styles.sectionTitle}>오늘의 추천 상품</h2>

                    <ul className={styles.productGrid}>
                        <li className={styles.productItem}>
                            <div className={styles.productCard}>상품1</div>
                            <div className={styles.productInfo}>
                                <p className={styles.productTitle}>미소빵빵 GF 쌀로 만든 한입간식</p>
                                <p className={styles.productPrice}>3,300원</p>
                            </div>
                        </li>

                        <li className={styles.productItem}>
                            <div className={styles.productCard}>상품2</div>
                            <div className={styles.productInfo}>
                                <p className={styles.productTitle}>미소빵빵 GF 쌀로 만든 한입간식</p>
                                <p className={styles.productPrice}>3,300원</p>
                            </div>
                        </li>

                        <li className={styles.productItem}>
                            <div className={styles.productCard}>상품3</div>
                            <div className={styles.productInfo}>
                                <p className={styles.productTitle}>미소빵빵 GF 쌀로 만든 한입간식</p>
                                <p className={styles.productPrice}>3,300원</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* 섹션 2 — 인기 소품 */}
                <div className={styles.sectionBox}>
                    <h2 className={styles.sectionTitle}>지금 인기 있는 소품</h2>

                    <ul className={styles.productGrid}>
                        <li>
                            <li className={styles.productCard}>상품1</li>
                            <div className={styles.productInfo}>
                                <p className={styles.productTitle}>미소빵빵 GF 쌀로 만든 한입간식</p>
                                <p className={styles.productPrice}>3,300원</p>
                            </div>
                        </li>
                        <li>
                            <li className={styles.productCard}>상품2</li>
                            <div className={styles.productInfo}>
                                <p className={styles.productTitle}>미소빵빵 GF 쌀로 만든 한입간식</p>
                                <p className={styles.productPrice}>3,300원</p>
                            </div>
                        </li>
                        <li>
                            <li className={styles.productCard}>상품3</li>
                            <div className={styles.productInfo}>
                                <p className={styles.productTitle}>미소빵빵 GF 쌀로 만든 한입간식</p>
                                <p className={styles.productPrice}>3,300원</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <TopStudios />
            </section>
        </>
    )
}
