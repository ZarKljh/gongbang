'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/app/utils/api'
import { useEffect, useMemo, useState } from 'react'
import styles from '@/app/components/product/detail/styles/Detail.module.css'
import Link from 'next/link'

type ProductDetail = {
    id: number
    name: string
    subtitle?: string
    summary?: string
    description?: string
    basePrice: number
    stockQuantity: number
    //images?: string[]
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

type gongbangImage = {
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
// ⭐ 실제 API 응답의 data 형태
type ProductDetailApiResponse = {
    productDetailList: ProductDetail
    detailImage: ProductImage | null
    studioDetail: StudioDetail | null
    gbImage: gongbangImage | null
    followInfo: FollowInfo | null
}

// type Props = { 안쓸거임 쿼리스트링에서 읽는걸로 개발해버렸음
//     /** 선택: 외부에서 productId를 넘길 수도 있고, 없으면 쿼리스트링에서 읽음 */
//     productId?: string | number
//     onBuy?: (id: number, qty: number) => void
//     onAddCart?: (id: number, qty: number) => void
//     onToggleFav?: (id: number) => void
// }

export default function ProductDetailView({}) {
    const searchParams = useSearchParams()
    const productId = searchParams.get('productId')

    const [count, setCount] = useState(1)
    const [isFollowed, setIsFollowed] = useState<boolean>(false)
    const [followerCount, setFollowerCount] = useState<number>(0)

    const { data, isLoading, isError, error } = useQuery<ProductDetailApiResponse>({
        queryKey: ['productDetail', productId],
        queryFn: async () => {
            const res = await api.get(`/product/${productId}/detail`)
            // ✅ 백엔드의 data 전체 반환
            console.log(res.data.data)

            // followInfo 읽기
            const followInfo = res.data.data.followInfo

            if (followInfo) {
                setIsFollowed(followInfo.followed)
                setFollowerCount(followInfo.followerCount)
            } else {
                setIsFollowed(false)
                setFollowerCount(0)
            }

            return res.data.data as ProductDetailApiResponse
        },
        enabled: !!productId,
        retry: 1,
        refetchOnWindowFocus: false,
    })
    // followInfo를 state에 동기화
    useEffect(() => {
        if (!data?.followInfo) {
            setIsFollowed(false)
            setFollowerCount(0)
            return
        }

        setIsFollowed(data.followInfo.followed)
        setFollowerCount(data.followInfo.followerCount)
    }, [data])

    // 구조 분해
    const product = data?.productDetailList
    const detailImage = data?.detailImage
    const sellerinfo = data?.studioDetail
    const gbLogo = data?.gbImage
    const followRes = data?.followInfo

    const pdImageUrl = detailImage
        ? `http://localhost:8090${detailImage.imageUrl}`
        : 'http://localhost:8090/uploads/products/no-image-soft.png' // 기본 이미지 경로

    const gbImageUrl = gbLogo
        ? `http://localhost:8090${gbLogo.imageUrl}`
        : 'http://localhost:8090/uploads/products/no-image-soft.png' // 기본 이미지 경로

    const unitPrice = useMemo(() => product?.basePrice ?? 0, [product])
    const total = unitPrice * count

    if (isLoading) return <p>로딩 중...</p>
    if (isError) {
        return <p>상품 정보를 불러오지 못했습니다.</p>
    }

    const inc = () => setCount((v) => v + 1)
    const dec = () => setCount((v) => (v > 1 ? v - 1 : 1))

    const handleToggleLike = (studioId: number) => {
        api.post(`product/${studioId}/follow`)
            .then((res) => {
                console.log('follow response:', res.data)

                const { resultCode, msg, data } = res.data

                if (resultCode !== '200') {
                    alert(msg)
                    return
                }

                const followed: boolean = data.followed
                const followCount: number = data.followerCount

                setIsFollowed(followed)
                setFollowerCount(followCount)
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    alert('로그인이 필요합니다.')
                } else {
                    alert('로그인이 필요합니다.')
                    console.error('팔로우 에러:', err)
                }
            })
    }

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
                        {/* 재고 표시가 필요하면: */}
                        {/* <em className={styles.stock}>재고 {product.stockQuantity}개</em> */}
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
                                                e.preventDefault() // 링크 이동 막기
                                                handleToggleLike(sellerinfo.studioId)
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
                            <button className={styles.btnCart}>장바구니</button>
                            <button className={styles.btnFav}>♥</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
