'use client'

import './reviewRank.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaStar } from 'react-icons/fa'
import Link from 'next/link'

interface ReviewRank {
    img?: string
    productId: number
    name: string
    rating: number
    reviewCount: number
    price: number
}

export default function ReviewRank() {
    const [products, setProducts] = useState<PopularReviewProduct[]>([])
        // const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchPopularProducts = async () => {
            try {
                const res = await fetch('http://localhost:8090/api/v1/reviews/popular', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (!res.ok) {
                    console.error('❌ API 응답 오류:', res.status)
                    return
                }

                const json = await res.json()
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

            <div className="review-rank-list">
                {products.map((p, i) => (
                    <Link
                        key={i}
                        className="review-rank-card"
                        href={{ pathname: '/product/list/detail', query: { productId: p.productId } }}
                    >
                        <div className="review-rank-image-wrapper">
                            {p.img ? (
                                <img src={p.img} alt="상품 이미지" />
                            ) : (
                                <span className="review-rank-image-placeholder">이미지 없음</span>
                            )}
                        </div>

                        {/* 상품명 */}
                        <p className="review-rank-title">{p.name}</p>

                        {/* 가격 */}
                        <p className="review-rank-price">{p.price.toLocaleString()}원</p>

                        {/* 별점 + 리뷰수 */}
                        <div className="review-rank-rating">
                            <FaStar></FaStar>
                            {p.rating} ({p.reviewCount.toLocaleString()}개)
                        </div>
                    </Link>

                ))}
            </div>
        </section>
    )
}
