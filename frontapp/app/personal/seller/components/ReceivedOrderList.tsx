'use client'

import Link from 'next/link'

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

    // 🔹 배송 관련 필드 (백엔드 DTO에서 추가해 주면 됨)
    courierName?: string | null
    trackingNumber?: string | null
    deliveryStatus?: string | null

    items: OrderItem[]
}

interface ReceivedOrderListProps {
    orders: OrdersResponse[]
}

export default function ReceivedOrderList({ orders }: ReceivedOrderListProps) {
    if (!orders || orders.length === 0) {
        return (
            <div className="order-list">
                <h2>받은 주문</h2>
                <p>아직 들어온 주문이 없습니다.</p>
            </div>
        )
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

    return (
        <div className="order-list">
            <h2>받은 주문</h2>

            <table className="order-table">
                <thead>
                    <tr>
                        <th>주문번호</th>
                        <th>주문일시</th>
                        <th>상품명</th>
                        <th>수량</th>
                        <th>결제금액</th>
                        <th>구매자</th>
                        <th>상태</th>
                        <th>상품보기</th>
                        <th>배송 관리</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => {
                        const firstItem = order.items?.[0]
                        const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0
                        const productTitle =
                            firstItem && order.items.length > 1
                                ? `${firstItem.productName} 외 ${order.items.length - 1}건`
                                : firstItem?.productName ?? '-'

                        const hasTracking = !!order.trackingNumber

                        return (
                            <tr key={order.orderId}>
                                <td>{order.orderCode}</td>
                                <td>{formatDate(order.createdDate)}</td>
                                <td>{productTitle}</td>
                                <td>{totalQuantity > 0 ? `${totalQuantity}개` : '-'}</td>
                                <td>{toNumber(order.totalPrice).toLocaleString()}원</td>
                                <td>{order.buyerNickname ?? '-'}</td>
                                <td>
                                    {getOrderStatusLabel(order.status)}
                                    {/* 배송 내역 */}
                                    {/* {order.deliveryStatus && (
                                        <div className="sub-status" style={{fontSize:'10px'}}>
                                            {getDeliveryStatusLabel(order.deliveryStatus)}
                                        </div>
                                    )} */}
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
                                        className={`btn-delivery-link ${hasTracking ? 'filled' : ''}`}
                                    >
                                        {hasTracking ? '배송 정보 수정' : '배송 정보 등록'}
                                    </Link>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
