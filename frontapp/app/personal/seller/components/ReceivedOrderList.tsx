'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

export type OrderItem = {
    productId: number
    productName: string
    quantity: number
    price: number
}

export type OrdersResponse = {
    orderId: number
    userId: number
    orderCode: string
    totalPrice: number | string
    createdDate: string
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'TEMP' | string
    buyerNickname?: string

    // 🔹 백엔드에서 내려주는 필드
    courierName?: string | null
    trackingNumber?: string | null
    deliveryStatus?: string | null

    items: OrderItem[]
}

interface ReceivedOrderListProps {
    orders: OrdersResponse[]
}

/* ================== 트래킹 타입 / 헬퍼 ================== */

type NormalizedDeliveryStatus = 'PENDING' | 'DELIVERING' | 'DELIVERED'
type ManageState = 'NEED_REGISTER' | 'IN_PROGRESS' | 'DELIVERED'
type FilterType = 'NEED_REGISTER' | 'IN_PROGRESS' | 'DELIVERED' | 'ALL'

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

const TRACKING_API_BASE_URL = 'http://localhost:8090/api/v1'

// 텍스트/코드 기반 배송 상태 정규화
const normalizeDeliveryStatusText = (deliveryStatus?: string | null): NormalizedDeliveryStatus => {
    if (!deliveryStatus) return 'PENDING'
    const s = deliveryStatus.toUpperCase().replace(/\s/g, '')

    if (s.includes('DELIVERED') || s.includes('배송완료')) return 'DELIVERED'
    if (s.includes('DELIVERING') || s.includes('배송중')) return 'DELIVERING'

    return 'PENDING'
}

// 트래킹 steps 기반으로 최종 상태 추론
const inferStatusFromTrackingSteps = (tracking?: TrackingDetail | null): NormalizedDeliveryStatus | null => {
    if (!tracking || !tracking.steps || tracking.steps.length === 0) return null

    const validSteps = tracking.steps.filter((s) => s.time)
    const latest =
        validSteps.length > 0
            ? validSteps.slice().sort((a, b) => {
                  const ta = new Date(a.time as string).getTime()
                  const tb = new Date(b.time as string).getTime()
                  return tb - ta
              })[0]
            : tracking.steps[0]

    const code = (latest.statusCode || '').toUpperCase()
    const text = (latest.status || '').toUpperCase().replace(/\s/g, '')

    if (code === 'DELIVERED') return 'DELIVERED'
    if (code === 'OUT_FOR_DELIVERY' || code === 'IN_TRANSIT' || code === 'AT_PICKUP') return 'DELIVERING'

    if (text.includes('배송완료') || text.includes('DELIVERED')) return 'DELIVERED'
    if (
        text.includes('배송출발') ||
        text.includes('배송중') ||
        text.includes('배송중입니다') ||
        text.includes('INTRANSIT')
    ) {
        return 'DELIVERING'
    }

    return 'PENDING'
}

// 결제/주문 상태 라벨
const getOrderStatusLabel = (status: OrdersResponse['status']) => {
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

// 배송 관리 버튼 라벨
const getManageButtonLabel = (state: ManageState) => {
    switch (state) {
        case 'NEED_REGISTER':
            return '배송 정보 등록'
        case 'IN_PROGRESS':
            return '배송 정보 수정'
        case 'DELIVERED':
            return '배송 완료'
        default:
            return '배송 관리'
    }
}

// 배송 관리 버튼 CSS 클래스
const getManageButtonClass = (state: ManageState) => {
    switch (state) {
        case 'NEED_REGISTER':
            return 'btn-delivery-link'
        case 'IN_PROGRESS':
            return 'btn-delivery-link filled'
        case 'DELIVERED':
            return 'btn-delivery-link completed'
        default:
            return 'btn-delivery-link'
    }
}

export default function ReceivedOrderList({ orders }: ReceivedOrderListProps) {
    // 기본 필터: 배송 정보 등록 필요
    const [filter, setFilter] = useState<FilterType>('NEED_REGISTER')

    // orderId 기준 실시간 배송 상태 맵
    const [trackingStatusMap, setTrackingStatusMap] = useState<Record<number, NormalizedDeliveryStatus>>({})

    /* ============ 트래킹 호출해서 실시간 상태 채우기 ============ */
    useEffect(() => {
        if (!orders || orders.length === 0) {
            setTrackingStatusMap({})
            return
        }

        console.log('[Seller ReceivedOrderList] tracking fetch start, orders =', orders)

        const fetchTrackingStatuses = async () => {
            try {
                const entries = await Promise.all(
                    orders.map(async (o) => {
                        let normalized: NormalizedDeliveryStatus = normalizeDeliveryStatusText(o.deliveryStatus)

                        console.log('[Seller] orderId:', o.orderId, 'trackingNumber:', o.trackingNumber)

                        // 운송장 없으면 /tracking 안 부름
                        if (!o.trackingNumber) {
                            console.log(' -> skip axios, no trackingNumber')
                            return [o.orderId, normalized] as [number, NormalizedDeliveryStatus]
                        }

                        try {
                            console.log(' -> call axios GET /seller/orders/' + o.orderId + '/tracking')
                            const res = await axios.get(
                                `${TRACKING_API_BASE_URL}/seller/orders/${o.orderId}/tracking`,
                                { withCredentials: true },
                            )
                            console.log(' <- tracking response', o.orderId, res.data)

                            if (res.data.resultCode === '200') {
                                const tracking: TrackingDetail = res.data.data
                                const inferred = inferStatusFromTrackingSteps(tracking)
                                const fromTrackingText = normalizeDeliveryStatusText(tracking.deliveryStatus)

                                normalized =
                                    inferred || fromTrackingText || normalizeDeliveryStatusText(o.deliveryStatus)
                            }
                        } catch (e) {
                            console.error('tracking fetch error (seller list) for order', o.orderId, e)
                        }

                        return [o.orderId, normalized] as [number, NormalizedDeliveryStatus]
                    }),
                )

                const map: Record<number, NormalizedDeliveryStatus> = {}
                entries.forEach(([id, status]) => {
                    map[id] = status
                })
                setTrackingStatusMap(map)
            } catch (e) {
                console.error('trackingStatusMap build error (seller list):', e)
            }
        }

        fetchTrackingStatuses()
    }, [orders])

    /* ============ 헬퍼: 주문별 최종 배송 상태 & 관리 상태 ============ */

    const getNormalizedStatusForOrder = (order: OrdersResponse): NormalizedDeliveryStatus => {
        const fromMap = trackingStatusMap[order.orderId]
        if (fromMap) return fromMap

        return normalizeDeliveryStatusText(order.deliveryStatus)
    }

    const getManageState = (order: OrdersResponse): ManageState => {
        // 운송장 자체가 없으면 → 등록 필요
        if (!order.trackingNumber) return 'NEED_REGISTER'

        // 운송장은 있는데, 실시간 상태 보고 판단
        const norm = getNormalizedStatusForOrder(order)
        if (norm === 'DELIVERED') return 'DELIVERED'

        // 운송장 있고 아직 완료 아님 → 진행 중(수정 가능)
        return 'IN_PROGRESS'
    }

    /* ============ 기타 헬퍼 ============ */

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })

    const toNumber = (v: number | string | null | undefined) => {
        if (typeof v === 'number') return v
        if (!v) return 0
        const n = Number(v)
        return Number.isNaN(n) ? 0 : n
    }

    /* ============ 필터 적용 ============ */

    const filteredOrders = (orders || []).filter((order) => {
        const state = getManageState(order)

        switch (filter) {
            case 'NEED_REGISTER':
                return state === 'NEED_REGISTER'
            case 'IN_PROGRESS':
                return state === 'IN_PROGRESS'
            case 'DELIVERED':
                return state === 'DELIVERED'
            case 'ALL':
            default:
                return true
        }
    })

    return (
        <div className="order-list">
            <h2>받은 주문</h2>

            {/* 🔹 배송 관리 상태 필터 */}
            <div className="delivery-filter">
                <button
                    type="button"
                    className={`filter-btn ${filter === 'NEED_REGISTER' ? 'active' : ''}`}
                    onClick={() => setFilter('NEED_REGISTER')}
                >
                    배송 정보 등록 필요
                </button>
                <button
                    type="button"
                    className={`filter-btn ${filter === 'IN_PROGRESS' ? 'active' : ''}`}
                    onClick={() => setFilter('IN_PROGRESS')}
                >
                    배송 중 / 수정 가능
                </button>
                <button
                    type="button"
                    className={`filter-btn ${filter === 'DELIVERED' ? 'active' : ''}`}
                    onClick={() => setFilter('DELIVERED')}
                >
                    배송 완료
                </button>
                <button
                    type="button"
                    className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilter('ALL')}
                >
                    전체 보기
                </button>
            </div>

            {(!filteredOrders || filteredOrders.length === 0) && <p>해당 조건에 맞는 주문이 없습니다.</p>}

            {filteredOrders && filteredOrders.length > 0 && (
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>주문번호</th>
                            <th>주문일시</th>
                            <th>상품명</th>
                            <th>수량</th>
                            <th>결제금액</th>
                            <th>구매자</th>
                            <th>결제상태</th>
                            <th>상품보기</th>
                            <th>배송 관리</th>
                        </tr>
                    </thead>
                    <tbody className="order-table-con">
                        {filteredOrders.map((order) => {
                            const firstItem = order.items?.[0]
                            const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0
                            const productTitle =
                                firstItem && order.items.length > 1
                                    ? `${firstItem.productName} 외 ${order.items.length - 1}건`
                                    : firstItem?.productName ?? '-'

                            const manageState = getManageState(order)
                            const manageLabel = getManageButtonLabel(manageState)
                            const manageClass = getManageButtonClass(manageState)

                            return (
                                <tr key={order.orderId} className="order-table-item">
                                    <td>{order.orderCode}</td>
                                    <td>{formatDate(order.createdDate)}</td>
                                    <td>{productTitle}</td>
                                    <td>{totalQuantity > 0 ? `${totalQuantity}개` : '-'}</td>
                                    <td>{toNumber(order.totalPrice).toLocaleString()}원</td>
                                    <td>{order.buyerNickname ?? '-'}</td>
                                    <td>{getOrderStatusLabel(order.status)}</td>
                                    <td>
                                        {firstItem ? (
                                            <Link
                                                href={`/product/detail?productId=${firstItem.productId}`}
                                                className="order-link"
                                            >
                                                상품보기
                                            </Link>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>
                                        <Link
                                            href={`/personal/seller/orders/${order.orderId}/delivery`}
                                            className={manageClass}
                                        >
                                            {manageLabel}
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}
