'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/app/utils/api'
import { useMemo, useState } from 'react'
import styles from '@/app/components/product/detail/styles/Detail.module.css'
import Link from 'next/link'
import { queryClient } from '@/app/utils/ReactQueryProviders'
//토스페이먼츠
import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk'
import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

type ProductDetail = {
    id: number
    name: string
    subtitle?: string
    summary?: string
    description?: string
    basePrice: number
    stockQuantity: number
}

type ProductImage = {
    id: number
    imageUrl: string
    imageFileName?: string | null
    refId: number
    refType: 'PRODUCT'
    sortOrder: number
    createdDate: string
    modifiedDate?: string | null
}

type GongbangImage = {
    id: number
    imageUrl: string
    imageFileName?: string | null
    refId: number
    refType: 'STUDIO_LOGO'
    sortOrder: number
    createdDate: string
    modifiedDate?: string | null
}

type StudioDetail = {
    studioId: number
    siteUserId: number
    studioName: string
    studioDescription: string
    categoryId: number
    studioImg?: string | null
    createdDate?: string | null
    updatedDate?: string | null
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
}

type FollowInfo = {
    followed: boolean
    followerCount: number
}

type CartInfo = {
    inCart: boolean
}

type LikeInfo = {
    liked: boolean
    likeCount: number
}

// ✅ 실제 API 응답 형태
type ProductDetailApiResponse = {
    productDetailList: ProductDetail
    detailImage: ProductImage | null
    studioDetail: StudioDetail | null
    gbImage: GongbangImage | null
    followInfo: FollowInfo | null
    cartInfo: CartInfo | null
    productLikeInfo: LikeInfo | null
}

// 공통 응답 래퍼 타입 (resultCode, msg, data)
type CommonResponse<T> = {
    resultCode: string
    msg: string
    data: T
}

export default function ProductDetailView() {
    const searchParams = useSearchParams()
    const productId = searchParams.get('productId') // string | null

    //위젯
    const [widgetLoaded, setWidgetLoaded] = useState(false)
    const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
    const customerKey = 'lMWxsh58-vF7S1kAyBIuG'

    const [count, setCount] = useState(1)
    const { data, isLoading, isError, error } = useQuery<ProductDetailApiResponse>({
        queryKey: ['productDetail', productId],
        queryFn: async () => {
            if (!productId) {
                throw new Error('productId가 없습니다.')
            }

            const res = await api.get(`/product/${productId}/detail`)
            console.log('🔁 fetch product detail:', res.data.data)
            return res.data.data as ProductDetailApiResponse
        },
        enabled: !!productId,
        retry: 1,

        // 🔥 렌더(마운트)·포커스 때마다 항상 새로 가져오도록
        staleTime: 0, // 항상 금방 stale 취급
        refetchOnMount: 'always', // 컴포넌트 마운트될 때마다 refetch
        refetchOnWindowFocus: 'always', // 창 포커스 돌아올 때마다 refetch
        refetchOnReconnect: 'always', // 네트워크 재연결 시도 때 refetch
    })

    // 🟡 2) data에서 바로 값 꺼내쓰기
    const product = data?.productDetailList
    const detailImage = data?.detailImage
    const sellerinfo = data?.studioDetail
    const gbLogo = data?.gbImage

    const isFollowed: boolean = data?.followInfo?.followed ?? false
    const followerCount: number = data?.followInfo?.followerCount ?? 0
    const isInCart: boolean = data?.cartInfo?.inCart ?? false
    const liked: boolean = data?.productLikeInfo?.liked ?? false
    const likeCount: number = data?.productLikeInfo?.likeCount ?? 0

    const pdImageUrl = detailImage
        ? `http://localhost:8090${detailImage.imageUrl}`
        : 'http://localhost:8090/uploads/products/no-image-soft.png'

    const gbImageUrl = gbLogo
        ? `http://localhost:8090/images/${gbLogo.imageUrl}`
        : 'http://localhost:8090/uploads/products/no-image-soft.png'

    const unitPrice = useMemo(() => product?.basePrice ?? 0, [product])
    const total = unitPrice * count

    // 🟡 3) 팔로우 토글 뮤테이션 (캐시 직접 수정)
    const followMutation = useMutation({
        mutationFn: (studioId: number) =>
            api
                .post<CommonResponse<{ followed: boolean; followerCount: number }>>(`product/${studioId}/follow`)
                .then((res) => res.data),
        onSuccess: (resData) => {
            const { resultCode, msg, data: followData } = resData

            if (resultCode !== '200') {
                alert(msg)
                return
            }

            if (!productId) return

            // ✅ productDetail 캐시를 직접 업데이트
            queryClient.setQueryData<ProductDetailApiResponse>(['productDetail', productId], (old) =>
                old
                    ? {
                          ...old,
                          followInfo: {
                              followed: followData.followed,
                              followerCount: followData.followerCount,
                          },
                      }
                    : old,
            )
        },
        onError: (err: any) => {
            if (err?.response?.status === 401) {
                alert('로그인이 필요합니다.')
            } else {
                alert('로그인이 필요합니다.')
                console.error('팔로우 에러:', err)
            }
        },
    })

    // 🟡 4) 장바구니 토글 뮤테이션 (캐시 직접 수정)
    const cartMutation = useMutation({
        mutationFn: ([prodId, quantity]: [number, number]) =>
            api.post(`/product/${prodId}/cart`, { quantity }).then((res) => res.data),
        onSuccess: (resData) => {
            const { resultCode, data: cartData } = resData

            if (resultCode !== '200') return

            if (!productId) return

            queryClient.setQueryData(['productDetail', productId], (old: any) =>
                old
                    ? {
                          ...old,
                          cartInfo: {
                              inCart: cartData.inCart,
                          },
                      }
                    : old,
            )
            console.log('🧾 cartData:', cartData)
            alert('장바구니에 담았습니다.')
        },
        onError: (err: any) => {
            if (err?.response?.status === 401) {
                alert('로그인이 필요합니다.')
            } else {
                alert('로그인이 필요합니다.')
                console.error('장바구니 에러:', err)
            }
        },
    })

    // 🟡 4) 좋아요(WishList) 토글 뮤테이션 (캐시 직접 수정)
    const likeMutation = useMutation({
        mutationFn: (prodId: number) =>
            api
                .post<CommonResponse<{ liked: boolean; likeCount: number }>>(`product/${prodId}/like`)
                .then((res) => res.data),
        onSuccess: (resData) => {
            const { resultCode, msg, data: likeData } = resData

            if (resultCode !== '200') {
                alert(msg)
                return
            }

            if (!productId) return

            // ✅ productDetail 캐시를 직접 업데이트
            queryClient.setQueryData<ProductDetailApiResponse>(['productDetail', productId], (old) =>
                old
                    ? {
                          ...old,
                          productLikeInfo: {
                              liked: likeData.liked,
                              likeCount: likeData.likeCount,
                          },
                      }
                    : old,
            )
        },
        onError: (err: any) => {
            if (err?.response?.status === 401) {
                alert('로그인이 필요합니다.')
            } else {
                alert('로그인이 필요합니다.')
                console.error('팔로우 에러:', err)
            }
        },
    })

    if (isLoading) return <p>로딩 중...</p>

    if (isError) {
        console.error('상품 상세 에러:', error)
        return <p>상품 정보를 불러오지 못했습니다.</p>
    }

    const inc = () => setCount((v) => v + 1)
    const dec = () => setCount((v) => (v > 1 ? v - 1 : 1))

    const main = async () => {
        // 1) PaymentWidget 불러오기
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey)

        // 2) 금액 설정 (지금은 예시로 15000원)
        paymentWidget.renderPaymentMethods('#payment-method', {
            value: 15000,
        })

        // 3) 약관 UI 렌더링
        paymentWidget.renderAgreement('#agreement')

        setWidgetLoaded(true)

        // 4) 결제요청
        await paymentWidget.requestPayment({
            orderId: 'order_' + uuidv4(),
            orderName: '공예담 무드등',
            successUrl: `${window.location.origin}/pay/success`,
            failUrl: `${window.location.origin}/pay/fail`,
        })
    }

    return (
        <div className={styles.detailPage}>
            <div className={styles.layout}>
                {/* 좌: 이미지 */}
                <section className={styles.imagePanel}>
                    <div className={styles.imageSticky}>
                        <div className={styles.imageMain}>
                            <img src={pdImageUrl} alt={product?.name} />
                        </div>
                    </div>
                </section>

                {/* 우: 구매 패널 */}
                <section className={styles.purchaseSection}>
                    <h3 className={styles.productTitle}>{product?.name}</h3>

                    <div className={styles.productDesc}>
                        <p>{product?.description ?? '상품 설명이 없습니다.'}</p>
                    </div>

                    <div className={styles.optionRow}>
                        <span>상품 : {product?.name}</span>

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
                    </div>

                    {sellerinfo && (
                        <div className={styles.creatorBox}>
                            <div className={styles.creatorLeft}>
                                <img className={styles.creatorProfile} src={gbImageUrl} alt="프로필" />
                                <div className={styles.creatorInfo}>
                                    <div className={styles.creatorName}>{sellerinfo.studioName}</div>
                                    <div className={styles.creatorActions}>
                                        <button
                                            type="button"
                                            className={`${styles.btnFollow} ${isFollowed ? styles.active : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                followMutation.mutate(sellerinfo.studioId)
                                            }}
                                        >
                                            {isFollowed ? '팔로잉' : '+ 팔로우'}
                                        </button>
                                        <Link href={`/seller/studio/${sellerinfo.studioId}`} className={styles.btnHome}>
                                            작가홈
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.creatorRight}>
                                <div className={styles.followerLabel}>팔로워</div>
                                <div className={styles.followerCount}>{followerCount}</div>
                            </div>
                        </div>
                    )}

                    <div className={styles.buttonRow}>
                        <button className={styles.btnBuy} onClick={main}>
                            바로구매하기
                        </button>
                        {/* 결제 UI가 들어갈 영역 */}
                        {widgetLoaded && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modal}>
                                    <div className={styles.modalHeader}>
                                        <h2 className={styles.modalTitle}>결제하기</h2>
                                        <button
                                            type="button"
                                            onClick={() => setWidgetLoaded(false)}
                                            className={styles.modalCloseBtn}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* 결제 UI가 들어갈 영역 */}
                                    <div className={styles.paymentBody}>
                                        <div id="payment-method" className={styles.paymentMethods} />
                                        <div id="agreement" className={styles.paymentAgreement} />
                                    </div>

                                    <button
                                        type="button"
                                        // onClick={handleRequestPayment}
                                        className={styles.paymentSubmitBtn}
                                        disabled={!widgetLoaded}
                                    >
                                        결제하기
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.subButtons}>
                            <button
                                className={`${styles.btnCart} ${isInCart ? styles.active : ''}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (!product?.id) {
                                        console.warn('❗ product.id가 없습니다.')
                                        return
                                    }
                                    cartMutation.mutate([product.id, count])
                                }}
                            >
                                {'장바구니'}
                            </button>
                            <button
                                className={styles.btnFav}
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (!product?.id) return

                                    likeMutation.mutate(product.id)
                                }}
                            >
                                {liked ? '❤️' : '🤍'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
