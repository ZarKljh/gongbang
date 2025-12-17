'use client'

import './reviewRank.css'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaStar } from 'react-icons/fa'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from './api'

interface ReviewRank {
    thumbnail?: string
    productId: number
    name: string
    rating: number
    reviewCount: number
    price: number
}

export default function ReviewRank() {
    const [products, setProducts] = useState<ReviewRank[]>([])
    // const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const prevRef = useRef(null)
    const nextRef = useRef(null)

    useEffect(() => {
        const fetchPopularProducts = async () => {
            try {
                const res = await api.get('/reviews/popular')

                console.error('❌ API 응답 오류:', res.status)

                const json = res.data
                console.log('🔥 인기 리뷰 상품 API 응답:', json)

                setProducts(json.data || [])
            } catch (err) {
                console.error('❌ 인기 리뷰 상품 호출 중 에러:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchPopularProducts()
    }, [])

    if (loading) return <p>로딩 중...</p>

    return (
        <section className="review-rank-container">
            <div className="review-rank-header">'강추' 리뷰 100개 이상!</div>
            <div className="review-rank-sub">리뷰가 보장하는 상품이에요</div>

            {products.length === 0 && <div className="review-rank-empty-text">아직 인기 리뷰 상품이 없습니다.</div>}

            {products.length > 0 && (
                <div className="review-rank-slider-wrapper">
                    <Swiper
                        modules={[Navigation]}
                        // slidesPerView={4}
                        slidesPerView="auto"
                        slidesPerGroup={4}
                        // spaceBetween={20}
                        loop={false}
                        navigation={false}
                        onSwiper={(swiper) => {
                            setTimeout(() => {
                                swiper.params.navigation.prevEl = prevRef.current
                                swiper.params.navigation.nextEl = nextRef.current
                                swiper.navigation.init()
                                swiper.navigation.update()
                            }, 0)
                        }}
                        className="review-rank-swiper"
                        breakpoints={{
                            1200: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20},
                            992: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
                            768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
                            460: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 12 },
                            0: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 12 },
                        }}
                    >
                        {products.map((p) => (
                            <SwiperSlide key={p.productId}>
                                <Link
                                    className="review-rank-card"
                                    href={{
                                        pathname: '/product/list/detail',
                                        query: { productId: p.productId },
                                    }}
                                >
                                    <div className="review-rank-image-wrapper">
                                        {p.thumbnail ? (
                                            <img src={`http://localhost:8090${p.thumbnail}`} />
                                        ) : (
                                            <span className="review-rank-image-placeholder">준비 중</span>
                                        )}
                                    </div>

                                    <p className="review-rank-title">{p.name}</p>
                                    <p className="review-rank-price">{p.price.toLocaleString()}원</p>

                                    <div className="review-rank-rating">
                                        <FaStar style={{ color: '#FFD700' }} />
                                        {p.rating} ({p.reviewCount.toLocaleString()})
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* 커스텀 화살표 */}
                    <div ref={prevRef} className="review-rank-prev">
                        <ChevronLeft className="review-rank-btn-icon" size={26} strokeWidth={2.5} />
                    </div>
                    <div ref={nextRef} className="review-rank-next">
                        <ChevronRight className="review-rank-btn-icon" size={26} strokeWidth={2.5} />
                    </div>
                </div>
            )}
        </section>
    )
}
