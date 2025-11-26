'use client'

import api from '@/app/utils/api'
import { useEffect, useState } from 'react'
import styles from './main.module.css'

type TopStudio = {
    studioId: number
    studioName: string
    mainImageUrl: string | null
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
                    <div className={styles.studioList}>
                        {topStudio.map((studio) => (
                            <div key={studio.studioId} className={styles.studioCard}>
                                <img
                                    src={studio.mainImageUrl ?? "/default-studio.jpg"}
                                    alt={studio.studioName}
                                    className={styles.studioMainImg}
                                />

                                <h3 className={styles.studioName}>{studio.studioName}</h3>

                                <div className={styles.studioProductWrap}>
                                    {studio.recentProducts.map((p) => (
                                        <div key={p.productId} className={styles.productCardSmall}>
                                            <img
                                                src={p.imageUrl ?? "/default-product.png"}
                                                alt={p.productName}
                                                className={styles.productImgSmall}
                                            />
                                            <p className={styles.productNameSmall}>{p.productName}</p>
                                            <p className={styles.productsummary}>{p.summary}</p>
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