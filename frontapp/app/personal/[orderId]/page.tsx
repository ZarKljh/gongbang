'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import '@/app/personal/[orderId]/page.css'
import Link from 'next/link'
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}`
// export const IMAGE_BASE_URL = 'http://localhost:8090'

// ===== 타입 정의 =====
type DeliveryDto = {
    deliveryId: number
    orderId: number
    addressId: number
    trackingNumber: string | null
    deliveryStatus: string | null
    completedAt: string | null
    createdDate: string
    modifiedDate: string
    recipientName: string
    baseAddress: string
    detailAddress: string
    zipcode: string
}

type OrderItemDto = {
    orderItemId: number
    orderId: number
    productId: number
    productName: string
    quantity: number
    price: number
    imageUrl: string
}

type OrderDetailDto = {
    orderId: number
    userId: number
    orderCode: string
    totalPrice: number
    createdDate: string
    deliveryStatus: string | null
    completedAt: string | null
    status: string
    reason: string | null
    buyerNickname: string | null
    items: OrderItemDto[]
    deliveries: DeliveryDto[]
}

// /tracking 응답 타입
type TrackingStep = {
    location: string
    status: string
    statusCode: string | null
    driverPhone: string | null
    time: string | null
}

type TrackingDetail = {
    orderId: number
    orderCode: string
    orderCreatedDate: string
    orderStatus: string
    deliveryStatus: string | null
    courierName: string | null
    trackingNumber: string | null
    productBrand: string
    productName: string
    productOption: string
    productPrice: number
    productQuantity: number
    productImageUrl: string | null
    steps: TrackingStep[]
}

// 내부에서 쓸 정규화 상태
type NormalizedStatus = 'PENDING' | 'DELIVERING' | 'DELIVERED'

// steps 기반으로 최종 배송 상태 추론
const inferStatusFromTrackingSteps = (tracking?: TrackingDetail | null): NormalizedStatus | null => {
    if (!tracking || !tracking.steps || tracking.steps.length === 0) return null

    // time 있는 것들 기준으로 최신 순 정렬
    const validSteps = tracking.steps.filter((s) => s.time)
    const latest =
        validSteps.length > 0
            ? validSteps.slice().sort((a, b) => {
                  const ta = new Date(a.time as string).getTime()
                  const tb = new Date(b.time as string).getTime()
                  return tb - ta // 내림차순: 가장 최근 이벤트
              })[0]
            : tracking.steps[0]

    const code = (latest.statusCode || '').toUpperCase()
    const text = (latest.status || '').toUpperCase()

    // 1) statusCode 기반 판단 (가장 정확)
    if (code === 'DELIVERED') {
        return 'DELIVERED'
    }
    if (code === 'OUT_FOR_DELIVERY' || code === 'IN_TRANSIT' || code === 'AT_PICKUP') {
        return 'DELIVERING'
    }

    // 2) 코드가 비어있으면 status 텍스트로 한 번 더 체크
    if (text.includes('배송완료') || text.includes('DELIVERED')) {
        return 'DELIVERED'
    }
    if (
        text.includes('배송출발') ||
        text.includes('배송 중') ||
        text.includes('배송중') ||
        text.includes('IN_TRANSIT')
    ) {
        return 'DELIVERING'
    }

    // 그 외는 준비중
    return 'PENDING'
}

// 문자열 상태를 정규화
const normalizeStatus = (status?: string | null): NormalizedStatus => {
    if (!status) return 'PENDING'
    const s = status.toUpperCase()

    if (s.includes('DELIVERED') || s.includes('배송완료') || s.includes('배송 완료')) {
        return 'DELIVERED'
    }
    if (s.includes('DELIVERING') || s.includes('배송중') || s.includes('배송 중') || s.includes('IN_TRANSIT')) {
        return 'DELIVERING'
    }
    return 'PENDING'
}

// 상태 라벨 (화면에 찍히는 텍스트)
const getStatusLabel = (normalized: NormalizedStatus): string => {
    switch (normalized) {
        case 'DELIVERED':
            return '배송완료'
        case 'DELIVERING':
            return '배송중'
        case 'PENDING':
        default:
            return '배송준비중'
    }
}

// 뱃지 CSS 클래스
const getStatusBadgeClass = (normalized: NormalizedStatus): string => {
    switch (normalized) {
        case 'DELIVERED':
            return 'badge delivered'
        case 'DELIVERING':
            return 'badge delivering'
        case 'PENDING':
        default:
            return 'badge pending'
    }
}

export default function OrderDetailPage() {
    const { orderId } = useParams()
    const router = useRouter()

    const [order, setOrder] = useState<OrderDetailDto | null>(null)
    const [tracking, setTracking] = useState<TrackingDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isReasonModal, setIsReasonModal] = useState(false)
    const [reasonModalTitle, setReasonModalTitle] = useState('')
    const [reasonText, setReasonText] = useState('')

    const isReasonValid = reasonText.trim().length > 0

    useEffect(() => {
        if (!orderId) return
        fetchAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId])

    const getOrderStatusLabel = (status?: string) => {
        switch (status) {
            case 'PENDING':
                return '결제 대기'
            case 'PAID':
                return '결제 완료'
            case 'FAILED':
                return '결제 실패'
            case 'CANCELLED':
                return '취소'
            case 'TEMP':
                return '임시 주문'
            default:
                return status || '-'
        }
    }

    // 주문 상세 정보 요청
    // 주문 상세 + 배송 추적 둘 다 요청
    const fetchAll = async () => {
        setLoading(true)
        try {
            // 1) 주문 상세
            const orderRes = await axios.get(`${API_BASE_URL}/mypage/orders/${orderId}`, {
                withCredentials: true,
            })
            const orderData: OrderDetailDto = orderRes.data.data
            setOrder(orderData)

            // 2) 배송 추적 (실패해도 주문 상세는 그대로 보여줌)
            try {
                const trackingRes = await axios.get(`${API_BASE_URL}/mypage/orders/${orderId}/tracking`, {
                    withCredentials: true,
                })
                if (trackingRes.data.resultCode === '200') {
                    const trackingData: TrackingDetail = trackingRes.data.data
                    setTracking(trackingData)
                }
            } catch (e) {
                console.error('배송 추적 조회 실패 (주문 상세만 사용):', e)
            }
        } catch (err) {
            setError('주문 정보를 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    // 완료 후 7일인지 체크
    const isWithinSevenDays = (dateString?: string) => {
        if (!dateString) return false
        const completedDate = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - completedDate.getTime())
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        return diffDays <= 7
    }

    // 모달 열기
    const openReasonModal = (title: string) => {
        setReasonModalTitle(title)
        setReasonText('')
        setIsReasonModal(true)
    }

    
    const validateReason = () => {
        if (!reasonText.trim()) {
            alert('사유를 입력해주세요.')
            return false
        }
        return true
    }

    // 취소
    const submitCancel = async () => {
        if (!validateReason()) return
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/mypage/orders/${orderId}/cancel`,
                { reason: reasonText },
                { withCredentials: true },
            )

            if (data.resultCode === '200') {
                alert('주문 취소되었습니다.')
                router.push('/personal?tab=orders')
            }
        } catch (err) {
            alert('주문 취소 중 오류 발생')
        }
    }

    // 반품
    const submitReturn = async () => {
        if (!validateReason()) return
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/mypage/orders/${orderId}/return`,
                { reason: reasonText },
                { withCredentials: true },
            )

            if (data.resultCode === '200') {
                alert('반품 신청 완료')
                router.push('/personal?tab=orders')
            }
        } catch (err) {
            alert('반품 신청 중 오류 발생')
        }
    }

    // 교환
    const submitExchange = async () => {
        if (!validateReason()) return
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/mypage/orders/${orderId}/exchange`,
                { reason: reasonText },
                { withCredentials: true },
            )

            if (data.resultCode === '200') {
                alert('교환 신청 완료')
                router.push('/personal?tab=orders')
            }
        } catch (err) {
            alert('교환 신청 중 오류 발생')
        }
    }

    if (loading) return <p className="loading">로딩중...</p>
    if (error) return <p className="error">{error}</p>
    if (!order) return <p>주문 정보가 없습니다.</p>

    const isActionDisabled =
        order.status === 'CANCELLED' ||
        order.status === 'RETURNED' ||
        order.status === 'EXCHANGED'

    // ===== 배송 상태 최종 결정 =====
    // 1순위: steps 기반 추론 (지금 JSON에서 statusCode 기준)
    const inferredFromSteps = inferStatusFromTrackingSteps(tracking)

    // 2순위: tracking.deliveryStatus (백엔드에서 세팅해줄 수 있는 값)
    const rawStatusFromTracking = tracking?.deliveryStatus ?? null

    // 3순위: 주문 상세의 deliveryStatus (DB 값)
    const rawStatusFromOrder = order.deliveryStatus ?? null

    const normalizedStatus: NormalizedStatus =
        inferredFromSteps || normalizeStatus(rawStatusFromTracking) || normalizeStatus(rawStatusFromOrder)

    const statusLabel = getStatusLabel(normalizedStatus)
    const badgeClass = getStatusBadgeClass(normalizedStatus)

    const firstDelivery = order.deliveries?.[0]

    return (
        <>
            <h2 className="order-detail-title">주문 상세 보기</h2>
            <div className="order-detail-container">
                <button
                    className="back-btn"
                    onClick={() => router.push('/personal?tab=orders')}
                >
                    ← 주문 목록으로
                </button>
                {/* 주문 기본 정보 */}
                <div className="order-detail-box">
                    <p>
                        <strong>주문일자:</strong> {order.createdDate}
                    </p>
                    <p>
                        <strong>주문번호:</strong> {order.orderCode}
                    </p>
                    <p>
                        <strong>주문상태:</strong>
                        <span className={`badge ${order.status}`}>{getOrderStatusLabel(order.status)}</span>
                    </p>
                    <p>
                        <strong>배송상태:</strong>
                        <span className={`badge badgeClass ${statusLabel}`}>{statusLabel}</span>
                    </p>

                    {firstDelivery && (
                        <>
                            <p>
                                <strong>운송장번호:</strong> {firstDelivery.trackingNumber || '없음'}
                            </p>
                            <p>
                                <strong>수령인:</strong> {firstDelivery.recipientName}
                            </p>
                            <p>
                                <strong>주소:</strong> {firstDelivery.baseAddress} {firstDelivery.detailAddress}
                            </p>
                            <p>
                                <strong>우편번호:</strong> {firstDelivery.zipcode}
                            </p>
                        </>
                    )}

                    {normalizedStatus === 'DELIVERED' && order.completedAt && (
                        <p>
                            <strong>배송완료일:</strong> {new Date(order.completedAt).toLocaleDateString('ko-KR')}
                        </p>
                    )}

                    {order.reason && (
                        <p className="order-reason">
                            <strong>처리 사유:</strong> {order.reason}
                        </p>
                    )}
                </div>

                {/* 상품 목록 */}
                <h3>상품 목록</h3>
                <div className="order-items-list">
                    {order.items?.map((item) => (
                        <div key={item.orderItemId} className="order-detail-item">
                            <img src={`${API_BASE_URL}${item.imageUrl}`} alt={item.productName} />
                            <div>
                                <Link
                                    href={`http://localhost:3000/product/list/detail?productId=${item.productId}`}
                                    className="my-review-product-name"
                                >
                                    <p className="item-name">{item.productName}</p>
                                </Link>
                                <p>
                                    {item.price.toLocaleString()}원 / {item.quantity}개
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 총 금액 */}
                <div className="order-total">
                    <p>
                        <strong>총 결제금액:</strong> {order.totalPrice?.toLocaleString()}원
                    </p>
                </div>

                {/* 주문 상태 버튼 */}
                <div className="order-actions">
                    {!isActionDisabled && (
                        <>
                            {/* 배송 준비중일 때만 취소 가능 */}
                            {normalizedStatus === 'PENDING' && (
                                <button className="btn-primary" onClick={() => openReasonModal('주문 취소 사유')}>
                                    주문 취소
                                </button>
                            )}

                            {/* 배송 완료 + 완료일 7일 이내일 때만 반품/교환 */}
                            {normalizedStatus === 'DELIVERED' && isWithinSevenDays(order.completedAt) && (
                                <>
                                    <button className="btn-primary" onClick={() => openReasonModal('반품 사유')}>
                                        반품 신청
                                    </button>

                                    <button className="btn-primary" onClick={() => openReasonModal('교환 사유')}>
                                        교환 신청
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* 사유 입력 모달 */}
                {isReasonModal && (
                    <div className="reason-modal">
                        <div className="modal-content">
                            <h3>{reasonModalTitle}</h3>
                            <textarea value={reasonText} onChange={(e) => setReasonText(e.target.value)} placeholder="사유를 입력해주세요." />
                            
                            {/* 경고 메시지 */}
                            {!isReasonValid && (
                                <p className="reason-warning">
                                    사유는 반드시 입력해야 합니다.
                                </p>
                            )}
                            
                            <div className="modal-actions">
                                {reasonModalTitle.includes('취소') && (
                                    <button className="btn-primary" disabled={!isReasonValid} onClick={submitCancel}>
                                        제출
                                    </button>
                                )}
                                {reasonModalTitle.includes('반품') && (
                                    <button className="btn-primary" disabled={!isReasonValid} onClick={submitReturn}>
                                        제출
                                    </button>
                                )}
                                {reasonModalTitle.includes('교환') && (
                                    <button className="btn-primary" disabled={!isReasonValid} onClick={submitExchange}>
                                        제출
                                    </button>
                                )}

                                <button className="btn-secondary" disabled={!isReasonValid} onClick={() => setIsReasonModal(false)}>
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}