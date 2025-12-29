'use client'

import api from '@/app/utils/api'
import { useEffect, useState } from 'react'
import styles from './main.module.css'
import Link from 'next/link'
import TopStudios from './mainComponents/section-topStudio'
import ReviewRank from '@/app/utils/ReviewRank'
import MainSection02 from '@/app/components/main/sec02/MainSection02'

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
    //const BASE_URL = 'http://localhost:8090'
    const BASE_URL = 'https://api.gongyedam.shop'

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async (): Promise<void> => {
        try {
            // 1 카테고리 목록 먼저 요청
            const res = await api.get('category')

            // ✅ 구조 분해 (axios는 자동으로 JSON 파싱)
            const categoryList: Category[] = res.data.data.categoryList
            setCategories(categoryList)

            // 2 카테고리 ID별로 서브카테고리 병렬 요청
            const subPromises = categoryList.map(async (cat) => {
                const res = await api.get(`category/${cat.id}/sub`)
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

    /**
     * 방문 기록(팀원 코드 영향 없이 이 블록만 수정)
     * - 세션 내 1회만 기록
     * - 비로그인도 visitorId(localStorage)로 식별
     * - api baseURL 구성에 따라 경로 2개를 순차 시도
     */
    useEffect(() => {
        console.log('[VISIT] effect start')

        const VISITED_KEY = 'main_visited'
        if (sessionStorage.getItem(VISITED_KEY)) {
            console.log('[VISIT] skipped by sessionStorage')
            return
        }
        sessionStorage.setItem(VISITED_KEY, '1')

        // 비로그인 방문자 식별자: localStorage에 저장/재사용
        const VID_KEY = 'visitorId'
        let visitorId = localStorage.getItem(VID_KEY)
        if (!visitorId) {
            visitorId = (crypto as any)?.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`
            localStorage.setItem(VID_KEY, visitorId)
        }

        const payload = {
            path: '/',
            referrer: document.referrer || null,
            userId: null,
            visitorId,
        }

        console.log('[VISIT] posting payload:', payload)
        console.log('[VISIT] api baseURL:', (api as any)?.defaults?.baseURL)

        // baseURL이 http://localhost:8090 이면 '/api/v1/admin/metrics/visit'가 맞을 확률이 높고,
        // baseURL이 http://localhost:8090/api/v1 이면 '/admin/metrics/visit'가 맞을 확률이 높습니다.
        const tryPaths = ['/api/v1/admin/metrics/visit', '/admin/metrics/visit']

        ;(async () => {
            for (const p of tryPaths) {
                try {
                    const res = await api.post(p, payload)
                    console.log('[VISIT] success path:', p, 'status:', res?.status)
                    return
                } catch (e: any) {
                    console.warn('[VISIT] failed path:', p, e?.message || e)
                }
            }
        })()
    }, [])

    return (
        <>
            {/* 배너 */}
            <div className={styles.pageContainer}>
                <div className={styles.heroBanner}>
                    <img src={`${BASE_URL}/images/initImg/banner3.png`} alt="메인 배너입니다" />
                </div>
            </div>

            {/* 카테고리 */}
            <div className={styles.mainPage}>
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
                                            src={`${BASE_URL}/images/initImg/c${String(index + 1).padStart(
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
            </div>

            {/* 섹션 */}
            <section className={styles.recommendWrap}>
                {/* 섹션2번 컴포넌트로 묶음 */}
                <MainSection02 />
                <TopStudios />
                <ReviewRank />
            </section>
        </>
    )
}
