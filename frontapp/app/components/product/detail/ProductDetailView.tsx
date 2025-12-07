'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/app/utils/api'
import { useMemo, useState, useEffect } from 'react'
import styles from '@/app/components/product/detail/styles/Detail.module.css'
import Link from 'next/link'
import { queryClient } from '@/app/utils/ReactQueryProviders'
import { useRouter } from 'next/navigation'
// 토스페이먼츠
import { loadPaymentWidget /*, ANONYMOUS*/ } from '@tosspayments/payment-widget-sdk'
import { v4 as uuidv4 } from 'uuid'
import ReportButton from '@/app/admin/components/ReportButton'
import { useBuyBtn, usePrepareOrder } from '@/app/utils/api/order'

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
    const router = useRouter()

    // 토스 위젯 관련 상태
    const [paymentWidget, setPaymentWidget] = useState<any | null>(null)
    const [widgetLoaded, setWidgetLoaded] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
    const customerKey = 'lMWxsh58-vF7S1kAyBIuG'

    const [count, setCount] = useState(1)

    const { data, isLoading, isError, error } = useQuery<ProductDetailApiResponse>({
        queryKey: ['productDetail', productId],
        queryFn: async () => {
            if (!productId) {
                throw new Error('productId가 없습니다.')
            }

            const res = await api.get(`product/${productId}/detail`)
            console.log('🔁 fetch product detail:', res.data.data)
            return res.data.data as ProductDetailApiResponse
        },
        enabled: !!productId,
        retry: 1,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
        refetchOnReconnect: 'always',
    })

    // 🟡 2) data에서 값 꺼내쓰기
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
            const error = err?.response?.data?.error // ✅ 여기!
            if (error?.code === 'M002') {
                const result = window.confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')
                if (result) {
                    router.push('/auth/login')
                }
                return
            } else {
                console.error('팔로우 에러:', err)
            }
        },
    })

    // 🟡 4) 장바구니 토글 뮤테이션 (캐시 직접 수정)
    const cartMutation = useMutation({
        mutationFn: ([prodId, quantity]: [number, number]) =>
            api.post(`/product/${prodId}/cart`, { quantity }).then((res) => res.data),

        onSuccess: (resData, variables) => {
            const { resultCode, data: cartData } = resData
            if (resultCode !== '200') return

            if (!productId) return

            // variables 가 우리가 mutate 할 때 넘긴 [prodId, quantity]
            const [prodId, quantity] = variables as [number, number]

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

            alert(`🛒 '${product?.name ?? '상품'}' ${quantity}개를 장바구니에 담았어요!`)
            // 또는 product?.name 쓰고 싶으면 위에 product를 가져다 쓰면 됨
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
            const error = err?.response?.data?.error // ✅ 여기!
            if (error?.code === 'M002') {
                const result = window.confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')
                if (result) {
                    router.push('/auth/login')
                }
                return
            } else {
                console.error('좋아요 에러:', err)
            }
        },
    })

    // ✅ 토스 위젯 초기화 / 렌더 함수
    const main = async () => {
        try {
            console.log('🧩 main 실행, 현재 paymentWidget:', paymentWidget)

            let widget = paymentWidget

            // 1) 위젯 인스턴스가 없으면 처음 한 번만 생성
            if (!widget) {
                widget = await loadPaymentWidget(clientKey, customerKey)
                setPaymentWidget(widget)
            }

            // 2) 모달이 열릴 때마다 DOM에 다시 붙이기
            widget.renderPaymentMethods('#payment-method', { value: total })
            widget.renderAgreement('#agreement')

            setWidgetLoaded(true)
        } catch (e) {
            console.error('토스 위젯 초기화 중 오류:', e)
            setWidgetLoaded(false)
        }
    }

    // React Query mutation usePrepareOrder 훅
    const { mutateAsync: prepareOrderMutation } = usePrepareOrder()
    // React Query mutation useBuyBtn 훅
    const { mutateAsync: buyBtnMutation } = useBuyBtn()

    const handleRequestPayment = async () => {
        console.log('🧾 결제 버튼 클릭, paymentWidget:', paymentWidget)
        if (!paymentWidget || !product) {
            console.warn('❗ paymentWidget 또는 product 정보가 없습니다.')
            return
        }

        try {
            // 1️⃣ 먼저 서버에 임시 주문 생성 요청
            const prepare = await prepareOrderMutation({
                productId: product.id,
                quantity: count,
            })
            console.log(`orderId:${prepare.orderCode}`)
            await paymentWidget.requestPayment({
                amount: total, // 🔥 총 금액 (수량 반영)
                orderId: prepare.orderCode,
                orderName: product.name, // 🔥 상품명
                successUrl: `${window.location.origin}/pay/success`,
                failUrl: `${window.location.origin}/pay/fail`,
            })
        } catch (e) {
            console.error('결제 요청 중 오류:', e)
        }
    }

    // 🔥 모달이 열렸을 때 main() 실행 (⚠️ 훅이니까 if/return 위에 둔 것!)
    useEffect(() => {
        console.log('🎯 isModalOpen / total 변경:', isModalOpen, total)
        if (!isModalOpen) return
        main()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, total])

    // ────────────────── 여기까지가 "모든 훅 구역" ──────────────────

    if (isLoading) return <p>로딩 중...</p>

    if (isError) {
        console.error('상품 상세 에러:', error)
        return <p>상품 정보를 불러오지 못했습니다.</p>
    }

    const inc = () => setCount((v) => v + 1)
    const dec = () => setCount((v) => (v > 1 ? v - 1 : 1))

    // 바로구매하기버튼
    const openPaymentModal = async () => {
        try {
            await buyBtnMutation()
            setIsModalOpen(true)
        } catch (e: any) {
            console.error('💥 buyBtn error:', e)

            console.log('status = ', e?.response?.status)
            console.log('data   = ', e?.response?.data)
            const error = e?.response?.data?.error // ✅ 여기!

            //기본 배송지 없음
            if (error?.code === 'A001') {
                const result = window.confirm('기본 배송지가 설정되어 있지 않습니다.\n 배송 등록 페이지로 이동할까요?')

                if (result) {
                    router.push('/personal?tab=addresses')
                }
                return
            }

            // 로그인 안 되어 있음
            if (error?.code === 'M002') {
                const result = window.confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')

                if (result) {
                    router.push('/auth/login')
                }
                return // confirm 후에는 실행 중단
            }
            alert(error?.message || '기본 배송지가 설정되어 있지 않습니다2.')
        }
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
                    <div className={styles.purchaseHeadSection}>
                        <h3 className={styles.productTitle}>{product?.name}</h3>
                        {product?.id && <ReportButton targetType="PRODUCT" targetId={product.id} />}
                    </div>

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
                                            {isFollowed ? '언팔로우' : '+ 팔로우'}
                                        </button>
                                        <Link href={`/seller/studio/${sellerinfo.studioId}`} className={styles.btnHome}>
                                            작가홈
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* 
                            <div className={styles.creatorRight}>
                                <div className={styles.followerLabel}>팔로워</div>
                                <div className={styles.followerCount}>{followerCount}</div>
                            </div> */}
                        </div>
                    )}

                    <div className={styles.buttonRow}>
                        <button className={styles.btnBuy} onClick={openPaymentModal}>
                            바로구매하기
                        </button>

                        {/* 결제 모달 */}
                        {isModalOpen && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContainer}>
                                    {/* 헤더 */}
                                    <div className={styles.modalHeader}>
                                        <h2 className={styles.modalTitle}>결제하기</h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsModalOpen(false)
                                                setWidgetLoaded(false)
                                            }}
                                            className={styles.modalCloseBtn}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* ✅ 한 섹션 카드 안에 상품요약 + 결제위젯 같이 */}
                                    <div className={styles.modalSection}>
                                        {/* 상품 정보 요약 */}
                                        <div className={styles.modalProductSummary}>
                                            <div className={styles.summaryThumb}>
                                                <img src={pdImageUrl} alt={product?.name} />
                                            </div>

                                            <div className={styles.summaryText}>
                                                <div className={styles.summaryTitle}>{product?.name}</div>
                                                <div className={styles.summaryDesc}>
                                                    {product?.description ?? '상품 설명이 없습니다.'}
                                                </div>

                                                <div className={styles.summaryRow}>
                                                    <span className={styles.summaryLabel}>수량</span>
                                                    <span className={styles.summaryValue}>{count}개</span>
                                                </div>

                                                <div className={styles.summaryRow}>
                                                    <span className={styles.summaryLabel}>총 결제 금액</span>
                                                    <span className={styles.summaryTotal}>
                                                        {total.toLocaleString()}원
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 섹션 안 구분선 */}
                                        <div className={styles.sectionDivider} />

                                        {/* 토스 결제 위젯 영역 */}
                                        <div className={styles.paymentBox}>
                                            <div id="payment-method" className={styles.paymentMethods} />
                                            <div id="agreement" className={styles.paymentAgreement} />
                                        </div>
                                    </div>

                                    {/* 하단 결제 버튼 + 상태 텍스트(오른쪽 정렬 강조) */}
                                    <div className={styles.modalFooter}>
                                        <button
                                            type="button"
                                            onClick={handleRequestPayment}
                                            className={styles.paymentSubmitBtn}
                                            disabled={!widgetLoaded}
                                        >
                                            {widgetLoaded ? '결제하기' : '결제 준비중…'}
                                        </button>
                                    </div>
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
                                장바구니
                            </button>
                            <button
                                className={styles.btnFav}
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (!product?.id) return

                                    likeMutation.mutate(product.id)
                                }}
                            >
                                {liked ? '❤️' : '🤍'} ({likeCount})
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
