'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/app/utils/api'
import { useMemo, useState } from 'react'
import styles from '@/app/components/product/detail/styles/Detail.module.css'
import Link from 'next/link'
import { queryClient } from '@/app/utils/ReactQueryProviders'

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

// ✅ 실제 API 응답 형태
type ProductDetailApiResponse = {
    productDetailList: ProductDetail
    detailImage: ProductImage | null
    studioDetail: StudioDetail | null
    gbImage: GongbangImage | null
    followInfo: FollowInfo | null
    cartInfo: CartInfo | null
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

    const [count, setCount] = useState(1)
    const { data, isLoading, isError, error } = useQuery<ProductDetailApiResponse>({
        queryKey: ['productDetail', productId],
        queryFn: async () => {
            if (!productId) {
                throw new Error('productId가 없습니다.')
            }
            console.log('🔁 fetch product detail:', productId)
            const res = await api.get(`/product/${productId}/detail`)
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

    // 🟡 2) data에서 바로 값 꺼내쓰기 (로컬 state X)
    const product = data?.productDetailList
    const detailImage = data?.detailImage
    const sellerinfo = data?.studioDetail
    const gbLogo = data?.gbImage

    const isFollowed: boolean = data?.followInfo?.followed ?? false
    const followerCount: number = data?.followInfo?.followerCount ?? 0
    const isInCart: boolean = data?.cartInfo?.inCart ?? false

    const pdImageUrl = detailImage
        ? `http://localhost:8090${detailImage.imageUrl}`
        : 'http://localhost:8090/uploads/products/no-image-soft.png'

    const gbImageUrl = gbLogo
        ? `http://localhost:8090${gbLogo.imageUrl}`
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

    if (isLoading) return <p>로딩 중...</p>

    if (isError) {
        console.error('상품 상세 에러:', error)
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
                        <img src={pdImageUrl} alt={product?.name} />
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

                            <div className="creator-right">
                                <div className="follower-label">팔로워</div>
                                <div className="follower-count">{followerCount}</div>
                            </div>
                        </div>
                    )}

                    <div className={styles.buttonRow}>
                        <button className={styles.btnBuy}>바로구매하기</button>

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
                            <button className={styles.btnFav}>♥</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
