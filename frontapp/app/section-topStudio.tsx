'use client'

import api from '@/app/utils/api'
import { useEffect, useState } from 'react'
import styles from './main.module.css'
import Link from 'next/link'

type TopStudio = {
    studioId: number
    studioName: string
    mainImageUrl: string | null
    followerCount: number
    recentProducts: {
        productId: number
        productName: string
        summary: string
        imageUrl: string | null
        price: number
    }[]
}

export default function TopStudios() {
    const [topStudio, setTopStudio] = useState<TopStudio[]>([])

    useEffect(() => {
        fetchTopStudios()
    }, [])

    const fetchTopStudios = async () => {
        try {
            const res = await api.get('http://localhost:8090/api/home/v1/top-studios')
            if (res.data?.data) {
                setTopStudio(res.data.data)
            }
        } catch (err) {
            console.error("Top Studio load error:", err)
        }
    }

    return (
        <div className={styles.topStudioSection}>
            <h2 className={styles.sectionTitle}>오늘의 공방</h2>

            <div className={styles.topStudioSlider}>
                {topStudio.length === 0 ? (
                    <p>오늘의 공방이 없습니다.</p>
                ) : (
                    <div className={styles.topStudioList}>
                        {topStudio.map((studio, topStudio) => (
                            <div key={studio.studioId} className={styles.topStudioCard}>
                                <div className={styles.topStudioBox}>
                                    <img
                                        src={studio.mainImageUrl ?? "/default-studio.jpg"}
                                        alt={studio.studioName}
                                        className={styles.topStudioMainImg}
                                    />
                                    <h3 className={styles.topStudioName}>{studio.studioName}</h3>
                                    <p className={styles.topStudioFollowers}>
                                        팔로워 {studio.followerCount?.toLocaleString() || 0}명
                                    </p>
                                </div>
                                

                                <div className={styles.topStudioProductWrap}>
                                    {studio.recentProducts.map((p) => (
                                        <div key={p.productId} className={styles.topProductCardSmall}>
                                            <img
                                                src={p.imageUrl ?? "/default-product.png"}
                                                alt={p.productName}
                                                className={styles.topProductImgSmall}
                                            />
                                            <Link className={styles.topProductNameSmall} href={`http://localhost:3000/product/list/detail?productId=${p.productId}`}>
                                                {p.productName}
                                            </Link>
                                            <p className={styles.topProductsummary}>{p.summary}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}