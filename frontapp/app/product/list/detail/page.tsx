'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/app/utils/api'
import { useState } from 'react'
import styles from './Detail.module.css'

type ProductDetail = {
    id: number
    name: string
    subtitle?: string
    summary?: string
    description?: string
    basePrice: number
    stockQuantity: number
    images?: string[] // 백엔드에 없으면 유지해도 optional이니 문제 없음
}

export default function Detail() {
    const searchParams = useSearchParams()
    const productId = searchParams.get('productId')

    const [count, setCount] = useState(1)

    // ✅ React Query로 데이터 패칭
    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useQuery<ProductDetail>({
        queryKey: ['productDetail', productId],
        queryFn: async () => {
            const res = await api.get(`/product/${productId}/detail`)
            console.log('✅ 상품상세 응답:', res.data)
            return res.data.data.productDetailList
        },
        enabled: !!productId, // productId가 있을 때만 요청
        retry: 1,
        refetchOnWindowFocus: false,
    })

    // ✅ 수량 조절
    const handleIncrease = () => setCount((prev) => prev + 1)
    const handleDecrease = () => setCount((prev) => (prev > 1 ? prev - 1 : 1))

    const pricePerItem = product?.basePrice ?? 0
    const total = pricePerItem * count

    // ✅ 로딩 / 에러 상태
    if (!productId) return null
    if (isLoading) return <p>로딩 중...</p>
    if (isError || !product) {
        console.error('❌ 상품 상세 요청 실패:', error)
        return <p>상품 정보를 불러오지 못했습니다.</p>
    }

    return (
        <div className={styles.detailPage}>
            <div className={styles.layout}>
                {/* 왼쪽: 이미지 영역 */}
                <section className={styles.imagePanel}>
                    <div className={styles.imageMain}>상품이미지</div>
                </section>

                {/* 오른쪽: 구매 패널 */}
                <section className={styles.purchaseSection}>
                    <h3 className={styles.productTitle}>{product.name}</h3>

                    <div className={styles.productDesc}>
                        <p>{product.description ?? '상품 설명이 없습니다.'}</p>
                        {/* <div className={styles.priceInfo}>
                            <span>판매가</span>
                            <strong>{pricePerItem.toLocaleString()}원</strong>
                        </div> */}
                    </div>

                    <div className={styles.optionRow}>
                        <span>상품 : {product.name}</span>

                        <div className={styles.quantityControl}>
                            <button className={styles.qtyBtn} onClick={handleDecrease}>
                                −
                            </button>
                            <input type="number" readOnly value={count} className={styles.qtyInput} />
                            <button className={styles.qtyBtn} onClick={handleIncrease}>
                                +
                            </button>
                        </div>

                        <span className={styles.optionTotal}>{total.toLocaleString()}원</span>
                    </div>

                    <div className={styles.totalRow}>
                        <span>total price :</span>
                        <strong>
                            {total.toLocaleString()}원 ({count}개)
                        </strong>
                    </div>

                    <div className={styles.buttonRow}>
                        <button className={styles.btnBuy}>바로구매하기</button>
                        <div className={styles.subButtons}>
                            <button className={styles.btnCart}>장바구니</button>
                            <button className={styles.btnFav}>♥</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
