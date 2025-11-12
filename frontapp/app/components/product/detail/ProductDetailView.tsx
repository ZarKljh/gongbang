'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/app/utils/api'
import { useMemo, useState } from 'react'
import styles from '@/app/components/product/detail/styles/Detail.module.css'

type ProductDetail = {
    id: number
    name: string
    subtitle?: string
    summary?: string
    description?: string
    basePrice: number
    stockQuantity: number
    images?: string[]
}

type Props = {
    /** 선택: 외부에서 productId를 넘길 수도 있고, 없으면 쿼리스트링에서 읽음 */
    productId?: string | number
    onBuy?: (id: number, qty: number) => void
    onAddCart?: (id: number, qty: number) => void
    onToggleFav?: (id: number) => void
}

export default function ProductDetailView({ productId: productIdProp, onBuy, onAddCart, onToggleFav }: Props) {
    const searchParams = useSearchParams()
    const productId = String(productIdProp ?? searchParams.get('productId') ?? '')

    const [count, setCount] = useState(1)

    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useQuery<ProductDetail>({
        queryKey: ['productDetail', productId],
        queryFn: async () => {
            const res = await api.get(`/product/${productId}/detail`)
            return res.data.data.productDetailList as ProductDetail
        },
        enabled: !!productId,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    const unitPrice = useMemo(() => product?.basePrice ?? 0, [product])
    const total = unitPrice * count

    if (!productId) return null
    if (isLoading) return <p>로딩 중...</p>
    if (isError || !product) {
        console.error('❌ 상품 상세 요청 실패:', error)
        return <p>상품 정보를 불러오지 못했습니다.</p>
    }

    const inc = () => setCount((v) => v + 1)
    const dec = () => setCount((v) => (v > 1 ? v - 1 : 1))

    return (
        <div className={styles.detailPage}>
            <div className={styles.layout}>
                {/* 좌: 이미지 */}
                <section className={styles.imagePanel}>
                    <div className={styles.imageMain}>
                        {product.images?.length ? <img src={product.images[0]} alt="대표 이미지" /> : '상품이미지'}
                    </div>
                </section>

                {/* 우: 구매 패널 */}
                <section className={styles.purchaseSection}>
                    <h3 className={styles.productTitle}>{product.name}</h3>

                    <div className={styles.productDesc}>
                        <p>{product.description ?? '상품 설명이 없습니다.'}</p>
                    </div>

                    <div className={styles.optionRow}>
                        <span>상품 : {product.name}</span>

                        <div className={styles.quantityControl}>
                            <button className={styles.qtyBtn} onClick={dec}>
                                −
                            </button>
                            <input type="number" readOnly value={count} className={styles.qtyInput} />
                            <button className={styles.qtyBtn} onClick={inc}>
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
                        {/* 재고 표시가 필요하면: */}
                        {/* <em className={styles.stock}>재고 {product.stockQuantity}개</em> */}
                    </div>

                    <div className={styles.buttonRow}>
                        <button
                            className={styles.btnBuy}
                            onClick={() => (onBuy ? onBuy(product.id, count) : console.log('구매', product.id, count))}
                        >
                            바로구매하기
                        </button>

                        <div className={styles.subButtons}>
                            <button
                                className={styles.btnCart}
                                onClick={() =>
                                    onAddCart
                                        ? onAddCart(product.id, count)
                                        : console.log('장바구니', product.id, count)
                                }
                            >
                                장바구니
                            </button>
                            <button
                                className={styles.btnFav}
                                onClick={() =>
                                    onToggleFav ? onToggleFav(product.id) : console.log('좋아요', product.id)
                                }
                            >
                                ♥
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
