'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import styles from './DeliveryEdit.module.css'

const API_BASE_URL = 'http://localhost:8090/api/v1'

type SellerDeliveryDetail = {
    orderId: number
    orderCode: string
    createdDate: string
    totalPrice: number | string
    buyerNickname?: string | null

    deliveryStatus?: string | null
    courierName?: string | null
    trackingNumber?: string | null
}

type UpdateDeliveryRequest = {
    courierName: string
    trackingNumber: string
    deliveryStatus?: string
}

export default function SellerDeliveryEditPage() {
    const params = useParams<{ orderId: string }>()
    const router = useRouter()
    const orderId = params.orderId

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [detail, setDetail] = useState<SellerDeliveryDetail | null>(null)

    const [courierName, setCourierName] = useState('')
    const [trackingNumber, setTrackingNumber] = useState('')
    const [deliveryStatus, setDeliveryStatus] = useState('DELIVERING')

    const toNumber = (v: number | string | null | undefined) => {
        if (typeof v === 'number') return v
        if (!v) return 0
        const n = Number(v)
        return Number.isNaN(n) ? 0 : n
    }

    useEffect(() => {
        if (!orderId) return

        const fetchDetail = async () => {
            try {
                setLoading(true)
                setError(null)

                // 🔹 백엔드에서 셀러용 배송 정보 조회 API 필요:
                // GET /api/v1/seller/orders/{orderId}/delivery
                const { data } = await axios.get(`${API_BASE_URL}/seller/orders/${orderId}/delivery`, {
                    withCredentials: true,
                })

                const payload = data.data as SellerDeliveryDetail
                setDetail(payload)

                setCourierName(payload.courierName ?? '')
                setTrackingNumber(payload.trackingNumber ?? '')
                setDeliveryStatus(payload.deliveryStatus ?? 'DELIVERING')
            } catch (e: any) {
                console.error('배송 정보 조회 실패:', e)
                setError('배송 정보를 불러오지 못했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchDetail()
    }, [orderId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderId) return

        if (!courierName || !trackingNumber) {
            alert('택배사와 송장번호를 모두 입력해주세요.')
            return
        }

        const body: UpdateDeliveryRequest = {
            courierName,
            trackingNumber,
            deliveryStatus,
        }

        try {
            setSaving(true)

            // 🔹 셀러용 배송 정보 수정 API:
            // PATCH /api/v1/seller/orders/{orderId}/delivery
            const { data } = await axios.patch(`${API_BASE_URL}/seller/orders/${orderId}/delivery`, body, {
                withCredentials: true,
            })

            if (data.resultCode === '200') {
                alert('배송 정보가 저장되었습니다.')
                router.back()
            } else {
                alert(data.msg ?? '배송 정보 저장에 실패했습니다.')
            }
        } catch (e: any) {
            console.error('배송 정보 저장 실패:', e)
            alert('배송 정보 저장 중 오류가 발생했습니다.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className={styles.page}>로딩 중...</div>
    }

    if (error || !detail) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <p className={styles.errorText}>{error ?? '주문 정보를 찾을 수 없습니다.'}</p>
                    <button type="button" onClick={() => router.back()} className={styles.secondaryBtn}>
                        뒤로가기
                    </button>
                </div>
            </div>
        )
    }

    const isEdit = !!detail.trackingNumber

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <button type="button" onClick={() => router.back()} className={styles.backButton}>
                        ← 돌아가기
                    </button>
                    <h1 className={styles.title}>{isEdit ? '배송 정보 수정' : '배송 정보 등록'}</h1>
                </header>

                {/* 주문 요약 카드 */}
                <section className={styles.card}>
                    <h2 className={styles.sectionTitle}>주문 정보</h2>
                    <div className={styles.orderSummary}>
                        <div className={styles.orderRow}>
                            <span className={styles.label}>주문번호</span>
                            <span className={styles.value}>{detail.orderCode}</span>
                        </div>
                        <div className={styles.orderRow}>
                            <span className={styles.label}>주문일시</span>
                            <span className={styles.value}>{detail.createdDate}</span>
                        </div>
                        <div className={styles.orderRow}>
                            <span className={styles.label}>총 결제금액</span>
                            <span className={styles.value}>{toNumber(detail.totalPrice).toLocaleString()}원</span>
                        </div>
                        <div className={styles.orderRow}>
                            <span className={styles.label}>구매자</span>
                            <span className={styles.value}>{detail.buyerNickname ?? '-'}</span>
                        </div>
                    </div>
                </section>

                {/* 배송 정보 입력 카드 */}
                <section className={styles.card}>
                    <h2 className={styles.sectionTitle}>배송 정보</h2>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formRow}>
                            <label className={styles.formLabel}>택배사</label>
                            <select
                                className={styles.select}
                                value={courierName}
                                onChange={(e) => setCourierName(e.target.value)}
                            >
                                <option value="">선택해주세요</option>
                                <option value="CJ대한통운">CJ대한통운</option>
                                <option value="한진택배">한진택배</option>
                                <option value="롯데택배">롯데택배</option>
                                <option value="로젠택배">로젠택배</option>
                                <option value="우체국택배">우체국택배</option>
                                {/* CarrierCodeMapper 에 등록한 이름들과 맞추기 */}
                            </select>
                        </div>

                        <div className={styles.formRow}>
                            <label className={styles.formLabel}>송장 번호</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예) 612345678901"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <p className={styles.helperText}>
                                실제 운송장 번호를 정확히 입력해야 배송 추적이 가능합니다.
                            </p>
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className={styles.secondaryBtn}
                                disabled={saving}
                            >
                                취소
                            </button>
                            <button type="submit" className={styles.primaryBtn} disabled={saving}>
                                {saving ? '저장 중...' : '저장하기'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    )
}
