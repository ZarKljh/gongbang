'use client'

import { useEffect, useMemo, useState } from 'react'
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

    // 배송 관련
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

const normalizeDeliveryStatusText = (deliveryStatus?: string | null): NormalizedDeliveryStatus => {
    if (!deliveryStatus) return 'PENDING'
    const s = deliveryStatus.toUpperCase().replace(/\s/g, '')
    if (s.includes('DELIVERED') || s.includes('배송완료')) return 'DELIVERED'
    if (s.includes('DELIVERING') || s.includes('배송중')) return 'DELIVERING'
    return 'PENDING'
}

const inferStatusFromTrackingSteps = (tracking?: TrackingDetail | null): NormalizedDeliveryStatus | null => {
    if (!tracking?.steps?.length) return null

    const validSteps = tracking.steps.filter((s) => s.time)
    const latest =
        validSteps.length > 0
            ? validSteps
                  .slice()
                  .sort((a, b) => new Date(b.time as string).getTime() - new Date(a.time as string).getTime())[0]
            : tracking.steps[0]

    const code = (latest.statusCode || '').toUpperCase()
    const text = (latest.status || '').toUpperCase().replace(/\s/g, '')

    if (code === 'DELIVERED') return 'DELIVERED'
    if (code === 'OUT_FOR_DELIVERY' || code === 'IN_TRANSIT' || code === 'AT_PICKUP') return 'DELIVERING'

    if (text.includes('배송완료') || text.includes('DELIVERED')) return 'DELIVERED'
    if (text.includes('배송출발') || text.includes('배송중') || text.includes('INTRANSIT')) return 'DELIVERING'

    return 'PENDING'
}

/* ================== 버튼 라벨/클래스 ================== */

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

const getManageButtonClass = (state: ManageState) => {
    // 프로젝트 CSS에 맞춰 className만 유지 (원하면 수정)
    switch (state) {
        case 'NEED_REGISTER':
            return 'btn-delivery-link'
        case 'IN_PROGRESS':
            return 'btn-delivery-link filled'
        case 'DELIVERED':
            return 'btn-delivery-link disabled'
        default:
            return 'btn-delivery-link'
    }
}

/* ================== 컴포넌트 ================== */

export default function ReceivedOrderList({ orders }: ReceivedOrderListProps) {
    const [filter, setFilter] = useState<FilterType>('NEED_REGISTER')
    const [trackingStatusMap, setTrackingStatusMap] = useState<Record<number, NormalizedDeliveryStatus>>({})

    useEffect(() => {
        if (!orders || orders.length === 0) {
            setTrackingStatusMap({})
            return
        }

        const fetchTrackingStatuses = async () => {
            try {
                const entries = await Promise.all(
                    orders.map(async (o) => {
                        let normalized: NormalizedDeliveryStatus = normalizeDeliveryStatusText(o.deliveryStatus)

                        // 운송장 없으면 tracking 호출 안 함
                        if (!o.trackingNumber) {
                            return [o.orderId, normalized] as [number, NormalizedDeliveryStatus]
                        }

                        try {
                            const res = await axios.get(
                                `${TRACKING_API_BASE_URL}/seller/orders/${o.orderId}/tracking`,
                                {
                                    withCredentials: true,
                                },
                            )

                            if (res.data?.resultCode === '200') {
                                const tracking: TrackingDetail = res.data.data
                                const inferred = inferStatusFromTrackingSteps(tracking)
                                const fromTrackingText = normalizeDeliveryStatusText(tracking.deliveryStatus)

                                normalized =
                                    inferred || fromTrackingText || normalizeDeliveryStatusText(o.deliveryStatus)
                            }
                        } catch (e) {
                            console.error('tracking fetch error for order', o.orderId, e)
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
                console.error('trackingStatusMap build error:', e)
            }
        }

        fetchTrackingStatuses()
    }, [orders])

    const getNormalizedStatusForOrder = (order: OrdersResponse): NormalizedDeliveryStatus => {
        const fromMap = trackingStatusMap[order.orderId]
        if (fromMap) return fromMap
        return normalizeDeliveryStatusText(order.deliveryStatus)
    }

    const getManageState = (order: OrdersResponse): ManageState => {
        if (!order.trackingNumber) return 'NEED_REGISTER'
        const norm = getNormalizedStatusForOrder(order)
        if (norm === 'DELIVERED') return 'DELIVERED'
        return 'IN_PROGRESS'
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })

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

    const getDeliveryStatusLabel = (status?: string | null) => {
        switch (status) {
            case '배송준비중':
                return '배송 준비 중'
            case '배송중':
                return '배송 중'
            case '배송완료':
                return '배송 완료'
            default:
                return null
        }
    }

    const toNumber = (v: number | string | null | undefined) => {
        if (typeof v === 'number') return v
        if (!v) return 0
        const n = Number(v)
        return Number.isNaN(n) ? 0 : n
    }

    const filteredOrders = useMemo(() => {
        return (orders || []).filter((order) => {
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
    }, [orders, filter, trackingStatusMap])

    if (!orders || orders.length === 0) {
        return (
            <div className="order-list">
                <h2>받은 주문</h2>
                <p>아직 들어온 주문이 없습니다.</p>
            </div>
        )
    }

    return (
        <div className="order-list">
            <h2>받은 주문</h2>

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

            {filteredOrders.length === 0 ? (
                <p>해당 조건에 맞는 주문이 없습니다.</p>
            ) : (
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
                                    <td>
                                        {getOrderStatusLabel(order.status)}
                                        {order.deliveryStatus && (
                                            <div className="sub-status" style={{ fontSize: '10px' }}>
                                                {getDeliveryStatusLabel(order.deliveryStatus)}
                                            </div>
                                        )}
                                    </td>
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
