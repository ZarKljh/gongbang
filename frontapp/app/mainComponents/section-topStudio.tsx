'use client'

import api from '@/app/utils/api'
import { useEffect, useState } from 'react'
import './section-topStudio.css'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const API_BASE_URL = api.defaults.baseURL
export const IMAGE_BASE_URL = API_BASE_URL?.replace('/api/v1', '')

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
    const [slideIndex, setSlideIndex] = useState(0)

    useEffect(() => {
        fetchTopStudios()
    }, [])

    const fetchTopStudios = async () => {
        try {
            const res = await api.get(`${API_BASE_URL}/home/top-studios`)
            if (res.data?.data) {
                setTopStudio(res.data.data)
            }
        } catch (err) {
            console.error('Top Studio load error:', err)
        }
    }

    const moveSlide = (dir: number) => {
        const maxIndex = topStudio.length - 1
        let next = slideIndex + dir
        if (next < 0) next = 0
        if (next > maxIndex) next = maxIndex
        setSlideIndex(next)
    }

    return (
        <div className="topStudioSection">
            <h2 className="sectionTitle">오늘의 공방</h2>

            <div className="sliderWrapper">
                {/* 왼쪽 버튼 */}
                {topStudio.length > 0 && (
                    <div className="review-rank-prev slideBtn prev" onClick={() => moveSlide(-1)}>
                        <ChevronLeft className="review-rank-btn-icon" size={26} strokeWidth={2.5} />
                    </div>
                )}

                <div className="topStudioList" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
                    {topStudio.length === 0 ? (
                        <p>오늘의 공방이 없습니다.</p>
                    ) : (
                        topStudio.map((studio) => (
                            <div key={studio.studioId} className="topStudioCard">
                                <div className="topStudioBox">
                                    <img
                                        src={`${IMAGE_BASE_URL}${studio.mainImageUrl}`}
                                        alt={studio.studioName}
                                        className="topStudioMainImg"
                                    />
                                    <div className="topStudioTxtBox">
                                        <Link className="topStudioName" href={`/seller/studio/${studio.studioId}`}>
                                            {studio.studioName}
                                        </Link>
                                        <p className="topStudioFollowers">
                                            팔로워 {studio.followerCount?.toLocaleString() || 0}명
                                        </p>
                                    </div>
                                </div>

                                <div className="topStudioProductWrap">
                                    {studio.recentProducts.map((p) => (
                                        <Link
                                            href={`/product/list/detail?productId=${p.productId}`}
                                            key={p.productId}
                                            className="topProductCardSmall"
                                        >
                                            <img
                                                src={`${IMAGE_BASE_URL}${p.imageUrl}`}
                                                alt={p.productName}
                                                className="topProductImgSmall"
                                            />
                                            <p className="topProductNameSmall">{p.productName}</p>
                                            <p className="topProductsummary">{p.summary}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 오른쪽 버튼 */}
                {topStudio.length > 0 && (
                    <div className="review-rank-next slideBtn next" onClick={() => moveSlide(1)}>
                        <ChevronRight className="review-rank-btn-icon" size={26} strokeWidth={2.5} />
                    </div>
                )}
            </div>
        </div>
    )
}
