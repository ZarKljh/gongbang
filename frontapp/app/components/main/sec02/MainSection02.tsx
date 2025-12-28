'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/app/utils/api'
import styles from '@/app/components/main/sec02/styles/MainSection02.module.css'
import Link from 'next/link'
import { useRef } from 'react'

type HotLikeProduct = {
    productId: number
    productName: string
    thumbnailUrl: string | null
    recentLikes: number
    basePrice: number
}

export default function MainSection02() {
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const BASE_URL = 'http://localhost:8090'
    //const BASE_URL = 'https://api.gongyedam.shop'

    const handleScroll = (direction: 'prev' | 'next') => {
        const el = viewportRef.current
        if (!el) return

        const amount = el.clientWidth * 0.8 // 화면의 80%만큼 이동
        el.scrollBy({
            left: direction === 'next' ? amount : -amount,
            behavior: 'smooth',
        })
    }

    const { data, isLoading, isError, error } = useQuery<HotLikeProduct[]>({
        queryKey: ['hotLikes'],
        queryFn: async () => {
            const res = await api.get('/product/hot/likes')
            console.log('🔥 fetch hot likes:', res.data.data)
            return res.data.data as HotLikeProduct[]
        },
        enabled: true,
        retry: 1,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
        refetchOnReconnect: 'always',
    })

    if (isLoading) return <p>인기 상품 불러오는 중...</p>
    if (isError) {
        console.error(error)
        return <p>인기 상품을 가져오는 데 실패했어요.</p>
    }

    const products = data ?? []

    if (products.length === 0) {
        return <p className={styles.rsBox}>아직 최근 3일간 좋아요 많은 상품이 없어요.</p>
    }

    return (
        <section className={styles.sectionBox}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>오늘의 랭킹아이템</h2>

                <div className={styles.controls}>
                    <button type="button" className={styles.navBtn} onClick={() => handleScroll('prev')}>
                        ◀
                    </button>
                    <button type="button" className={styles.navBtn} onClick={() => handleScroll('next')}>
                        ▶
                    </button>
                </div>
            </div>

            <div className={styles.viewport} ref={viewportRef}>
                <ul className={styles.track}>
                    {products.map((p) => {
                        const thumbnailSrc = p.thumbnailUrl
                            ? `${BASE_URL}${p.thumbnailUrl}`
                            : `${BASE_URL}/uploads/products/no-image-soft.png`

                        return (
                            <li key={p.productId} className={styles.productItem}>
                                <Link
                                    href={`/product/list/detail?productId=${p.productId}`}
                                    prefetch={false}
                                    className={styles.cardLink}
                                >
                                    <div className={styles.productCard}>
                                        <div className={styles.imageWrap}>
                                            <img src={thumbnailSrc} alt={p.productName} />
                                        </div>

                                        <div className={styles.productInfo}>
                                            <p className={styles.productTitle}>{p.productName}</p>
                                            <p className={styles.productPrice}>
                                                {p.basePrice.toLocaleString('ko-KR')}원
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
