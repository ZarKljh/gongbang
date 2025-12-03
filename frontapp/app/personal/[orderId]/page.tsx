'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import '@/app/personal/[orderId]/page.css'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:8090/api/v1/mypage'

export default function OrderDetailPage() {
    const { orderId } = useParams()
    const router = useRouter()

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isReasonModal, setIsReasonModal] = useState(false)
    const [reasonModalTitle, setReasonModalTitle] = useState("")
    const [reasonText, setReasonText] = useState("")

    useEffect(() => {
        fetchOrderDetail()
    }, [])

    // 주문 상세 정보 요청
    const fetchOrderDetail = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
                withCredentials: true,
            })
            setOrder(res.data.data)
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
        setReasonText("")
        setIsReasonModal(true)
    }

    // 취소
    const submitCancel = async () => {
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/orders/${orderId}/cancel`,
                { reason: reasonText },
                { withCredentials: true }
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
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/orders/${orderId}/return`,
                { reason: reasonText },
                { withCredentials: true }
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
        try {
            const { data } = await axios.patch(
                `${API_BASE_URL}/orders/${orderId}/exchange`,
                { reason: reasonText },
                { withCredentials: true }
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

    return (
        <>
            <h2 className='order-detail-title'>주문 상세 보기</h2>
            <div className="order-detail-container">
                {/* 주문 기본 정보 */}
                <div className="order-detail-box">
                    <p><strong>주문일자:</strong> {order.createdDate}</p>
                    <p><strong>주문번호:</strong> {order.orderCode}</p>
                    <p>
                        <strong>배송상태:</strong>
                        <span className={`badge ${order.deliveryStatus}`}>{order.deliveryStatus}</span>
                    </p>

                    {order.deliveries?.length > 0 && (
                        <>
                            <p><strong>운송장번호:</strong> {order.deliveries[0].trackingNumber || "없음"}</p>
                            <p><strong>수령인:</strong> {order.deliveries[0].recipientName}</p>
                            <p>
                                <strong>주소:</strong>{" "}
                                {order.deliveries[0].baseAddress} {order.deliveries[0].detailAddress}
                            </p>
                            <p><strong>우편번호:</strong> {order.deliveries[0].zipcode}</p>
                        </>
                    )}

                    {order.deliveryStatus === '배송완료' && order.completedAt && (
                        <p><strong>배송완료일:</strong> {new Date(order.completedAt).toLocaleDateString('ko-KR')}</p>
                    )}
                </div>

                {/* 상품 목록 */}
                <h3>상품 목록</h3>
                <div className="order-items-list">
                    {order.items?.map((item: any) => (
                        <div key={item.orderItemId} className="order-detail-item">
                            <img src={item.imageUrl || '/default-product.png'} alt="" />
                            <div>
                                <Link href={`http://localhost:3000/product/list/detail?productId=${item.productId}`} className="my-review-product-name">
                                    <p className="item-name">{item.productName}</p>
                                </Link>
                                <p>{item.price.toLocaleString()}원 / {item.quantity}개</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 총 금액 */}
                <div className="order-total">
                    <p><strong>총 결제금액:</strong> {order.totalPrice?.toLocaleString()}원</p>
                </div>

                {/* 주문 상태 버튼 */}
                <div className="order-actions">
                    {order.deliveryStatus === '배송준비중' && (
                        <button className="btn-primary" onClick={() => openReasonModal("주문 취소 사유")}>
                            주문 취소
                        </button>
                    )}

                    {order.deliveryStatus === '배송완료' && isWithinSevenDays(order.completedAt) && (
                        <>
                            <button className="btn-primary" onClick={() => openReasonModal("반품 사유")}>
                                반품 신청
                            </button>

                            <button className="btn-primary" onClick={() => openReasonModal("교환 사유")}>
                                교환 신청
                            </button>
                        </>
                    )}
                </div>

                {/* 뒤로가기 */}
                <button
                    className="back-btn"
                    onClick={() => router.push('/personal?tab=orders')}
                >
                    ← 주문 목록으로
                </button>

                {/* 모달 */}
                {isReasonModal && (
                    <div className="reason-modal">
                        <div className="modal-content">
                            <h3>{reasonModalTitle}</h3>
                            <textarea
                                value={reasonText}
                                onChange={(e) => setReasonText(e.target.value)}
                            />
                            <div className="modal-actions">
                                {reasonModalTitle.includes("취소") && (
                                    <button className="btn-primary" onClick={submitCancel}>
                                        제출
                                    </button>
                                )}
                                {reasonModalTitle.includes("반품") && (
                                    <button className="btn-primary" onClick={submitReturn}>
                                        제출
                                    </button>
                                )}
                                {reasonModalTitle.includes("교환") && (
                                    <button className="btn-primary" onClick={submitExchange}>
                                        제출
                                    </button>
                                )}

                                <button
                                    className="btn-secondary"
                                    onClick={() => setIsReasonModal(false)}
                                >
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