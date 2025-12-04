type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED' | string

interface OrderItem {
    id: number
    orderNumber: string
    createdAt: string
    productName: string
    buyerName: string
    status: OrderStatus
    totalPrice: number
}

interface OrderListProps {
    orders: OrderItem[]
}

export default function OrderList({ orders }: OrderListProps) {
    if (!orders || orders.length === 0) {
        return <p>받은 주문이 아직 없습니다.</p>
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING':
                return '결제 대기'
            case 'PAID':
                return '결제 완료'
            case 'SHIPPED':
                return '배송 중'
            case 'CANCELLED':
                return '취소'
            default:
                return status
        }
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
                        <th>구매자</th>
                        <th>상태</th>
                        <th>결제금액</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.orderNumber}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>{order.productName}</td>
                            <td>{order.buyerName}</td>
                            <td>{getStatusLabel(order.status)}</td>
                            <td>{order.totalPrice.toLocaleString()}원</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
