'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import styles from '../delivery.module.css'
import api from '@/app/utils/api'

const API_BASE_URL = `${api.defaults.baseURL}`

type TrackingStep = {
    location: string
    status: string
    statusCode?: string | null
    driverPhone?: string | null
    time: string // ISO 문자열 (백엔드에서 LocalDateTime -> ISO로 내려온다고 가정)
}

type OrderTrackingDetail = {
    orderId: number
    orderCode: string
    orderCreatedDate: string
    orderStatus: string

    deliveryStatus: string
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

type FaqItemProps = {
    question: string
    answer: React.ReactNode
}

function FaqItem({ question, answer }: FaqItemProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className={styles.faqItem}>
            <button type="button" className={styles.faqQuestion} onClick={() => setOpen((prev) => !prev)}>
                <span>{question}</span>
                <span className={styles.faqToggle}>{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className={styles.faqAnswer}>{answer}</div>}
        </div>
    )
}

export default function DeliveryPage() {
    const { orderId } = useParams<{ orderId: string }>()
    const router = useRouter()

    const [data, setData] = useState<OrderTrackingDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        if (!orderId) return

        const fetchTracking = async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await axios.get(`${API_BASE_URL}/mypage/orders/${orderId}/tracking`, {
                    withCredentials: true,
                })

                const rs = res.data
                if (rs.resultCode !== '200') {
                    throw new Error(rs.msg || '배송 정보를 불러오지 못했습니다.')
                }

                const tracking: OrderTrackingDetail = rs.data
                setData(tracking)
            } catch (e: any) {
                console.error('배송 조회 실패:', e)
                setError('배송 정보를 불러오지 못했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchTracking()
    }, [orderId])

    const handleCopyInvoice = () => {
        if (!data?.trackingNumber) return
        if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(data.trackingNumber)
            alert('송장번호가 복사되었습니다.')
        }
    }

    const formatDateShort = (isoStr: string | null | undefined) => {
        if (!isoStr) return ''
        const d = new Date(isoStr)
        if (Number.isNaN(d.getTime())) return isoStr

        const dayNames = ['일', '월', '화', '수', '목', '금', '토']
        const m = d.getMonth() + 1
        const day = d.getDate()
        const dow = dayNames[d.getDay()]

        return `${m}.${day}(${dow})`
    }

    const formatFullDate = (isoStr: string | null | undefined) => {
        if (!isoStr) return ''
        const d = new Date(isoStr)
        if (Number.isNaN(d.getTime())) return isoStr

        const year = d.getFullYear().toString().slice(2)
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const dayNames = ['일', '월', '화', '수', '목', '금', '토']
        const dow = dayNames[d.getDay()]

        return `${year}.${month}.${day}(${dow})`
    }

    const formatStepTime = (isoStr: string) => {
        const d = new Date(isoStr)
        if (Number.isNaN(d.getTime())) return isoStr

        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const dayNames = ['일', '월', '화', '수', '목', '금', '토']
        const dow = dayNames[d.getDay()]
        const hour = String(d.getHours()).padStart(2, '0')
        const min = String(d.getMinutes()).padStart(2, '0')

        return `${month}/${day}(${dow}) ${hour}:${min}`
    }

    // 기존 deliveryStatus 기반 로직 (fallback 용으로 남겨둠)
    const getStatusBarIndexFromDeliveryStatus = (deliveryStatus: string | undefined) => {
        if (!deliveryStatus) return 0
        const s = deliveryStatus.toUpperCase()

        if (s.includes('완료') || s.includes('DELIVERED')) return 2
        if (s.includes('출발') || s.includes('배송중') || s.includes('IN_TRANSIT') || s.includes('DELIVERING')) return 1

        return 0 // 준비중, 집하 중 등
    }

    // ✅ 최신 배송 이벤트(steps) 기준으로 상태바 단계 계산
    const getStatusBarIndexFromTracking = (tracking: OrderTrackingDetail): number => {
        const steps = tracking.steps ?? []
        if (!steps.length) {
            return getStatusBarIndexFromDeliveryStatus(tracking.deliveryStatus)
        }

        // 백엔드에서 최신순(가장 최근 이벤트가 0번)으로 정렬해서 내려준다고 가정
        const latest = steps[0]
        const code = (latest.statusCode ?? '').toUpperCase()
        const text = `${latest.status} ${latest.location}`.toUpperCase()

        // 2단계: 배송 완료
        if (
            code === 'DELIVERED' ||
            text.includes('배송완료') ||
            text.includes('배달완료') ||
            text.includes('배송 완료')
        ) {
            return 2
        }

        // 1단계: 배송 중
        if (
            code === 'IN_TRANSIT' ||
            code === 'OUT_FOR_DELIVERY' || // 배달 출발
            text.includes('배송중') ||
            text.includes('배달출발') ||
            text.includes('출발') ||
            text.includes('HUB') ||
            text.includes('허브') ||
            text.includes('간선') ||
            text.includes('터미널')
        ) {
            return 1
        }

        // 나머지는 준비중
        return 0
    }

    // ✅ 기사 연락처 추출
    const driverPhone: string | null = useMemo(() => {
        if (!data?.steps?.length) return null

        // 1순위: OUT_FOR_DELIVERY 상태에 driverPhone이 있는 이벤트
        const outForDeliveryStep = data.steps.find((step) => {
            const code = (step.statusCode ?? '').toUpperCase()
            const text = `${step.status} ${step.location}`.toUpperCase()
            return (
                code === 'OUT_FOR_DELIVERY' ||
                text.includes('배달출발') ||
                text.includes('배달 출발') ||
                text.includes('배송출발')
            )
        })

        if (outForDeliveryStep?.driverPhone) {
            return outForDeliveryStep.driverPhone
        }

        // 2순위: 어떤 스텝이든 driverPhone이 있는 경우
        const anyStepWithPhone = data.steps.find((step) => step.driverPhone)
        return anyStepWithPhone?.driverPhone ?? null
    }, [data])

    const handleCallDriver = () => {
        if (!driverPhone) {
            alert('배송 기사 연락처 정보를 찾을 수 없습니다.')
            return
        }
        // 모바일/PC 공통으로 tel: 링크 사용
        window.location.href = `tel:${driverPhone}`
    }

    if (loading) {
        return <main className={styles.page}>로딩 중...</main>
    }

    if (error || !data) {
        return (
            <main className={styles.page}>
                <p>{error ?? '배송 정보를 찾을 수 없습니다.'}</p>
                <button type="button" onClick={() => router.back()} className={styles.outlineButton}>
                    뒤로가기
                </button>
            </main>
        )
    }

    const statusIndex = getStatusBarIndexFromTracking(data)
    const visibleSteps = showAll ? data.steps : data.steps.slice(0, 4)
    const latestStep = data.steps[0]

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                {/* 상단 상태바 */}
                <section className={styles.card}>
                    <div className={styles.statusHeader}>
                        <span className={styles.statusDate}>
                            {formatDateShort(latestStep?.time ?? data.orderCreatedDate)}
                        </span>
                        <span className={styles.statusText}>
                            {statusIndex === 2
                                ? '상품 배송이 완료되었습니다'
                                : statusIndex === 1
                                ? '상품이 배송중입니다'
                                : '상품 준비중입니다'}
                        </span>
                    </div>

                    <div className={styles.statusBar}>
                        {['배송 시작', '배송중', '배송 완료'].map((label, idx) => (
                            <div key={label} className={styles.statusItem}>
                                <div className={idx === statusIndex ? styles.statusGraphActive : styles.statusGraph} />
                                <span className={idx === statusIndex ? styles.statusLabelActive : styles.statusLabel}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className={styles.divider} />

                {/* 상품 정보 */}
                <section className={styles.card}>
                    <div className={styles.productHeader}>
                        <span className={styles.productDate}>{formatFullDate(data.orderCreatedDate)}</span>
                        <button
                            className={styles.linkButton}
                            type="button"
                            onClick={() => router.push(`/personal/${data.orderId}`)}
                        >
                            주문 상세
                        </button>
                    </div>

                    <div className={styles.productBody}>
                        <div className={styles.productThumbnail}>
                            {data.productImageUrl ? (
                                <img src={data.productImageUrl} alt={data.productName} />
                            ) : (
                                <div className={styles.noImage}>이미지 없음</div>
                            )}
                        </div>

                        <div className={styles.productInfo}>
                            <div>
                                {data.productBrand && <div className={styles.productBrand}>{data.productBrand}</div>}
                                <div className={styles.productName}>{data.productName}</div>
                                <div className={styles.productOption}>
                                    {data.productOption || ''} / {data.productQuantity} 개
                                </div>
                            </div>
                            <div className={styles.productFooter}>
                                <span className={styles.productPrice}>{data.productPrice.toLocaleString()}원</span>
                                <button
                                    className={styles.outlineButton}
                                    type="button"
                                    onClick={() => router.push(`/product/detail?productId=${data.orderId}`)}
                                >
                                    상품 보기
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className={styles.divider} />

                {/* 배송/운송장 + 진행 상태 */}
                <section className={styles.card}>
                    {/* 택배사 / 송장 */}
                    <div className={styles.trackingInfo}>
                        <div className={styles.trackingRow}>
                            <span className={styles.trackingLabel}>택배사</span>
                            <span className={styles.trackingValue}>{data.courierName || '정보 없음'}</span>
                        </div>
                        <div className={styles.trackingRow}>
                            <span className={styles.trackingLabel}>송장 번호</span>
                            <button
                                className={styles.invoiceButton}
                                type="button"
                                onClick={handleCopyInvoice}
                                disabled={!data.trackingNumber}
                            >
                                <span className={styles.invoiceNumber}>{data.trackingNumber || '-'}</span>
                                <span className={styles.invoiceCopyText}>복사</span>
                            </button>
                        </div>
                    </div>

                    {/* 버튼들 */}
                    <div className={styles.trackingButtons}>
                        {/* 택배사 고객센터 버튼 제거 */}
                        <button
                            className={styles.outlineButton}
                            type="button"
                            onClick={handleCallDriver}
                            disabled={!driverPhone}
                        >
                            {driverPhone ? '배송 기사에게 전화하기' : '배송 기사 연락처 준비중'}
                        </button>
                    </div>

                    {/* 진행 상태 타임라인 */}
                    <div className={styles.timelineSection}>
                        <div className={styles.timelineWrapper}>
                            <div className={styles.timelineList}>
                                {visibleSteps.map((step, idx) => (
                                    <div key={`${step.location}-${step.time}-${idx}`} className={styles.timelineItem}>
                                        <div className={styles.timelineLeft}>
                                            <div className={styles.timelineIconWrapper}>
                                                {idx === 0 ? (
                                                    <div className={styles.timelineIconActiveOuter}>
                                                        <div className={styles.timelineIconActiveInner} />
                                                    </div>
                                                ) : (
                                                    <div className={styles.timelineIcon} />
                                                )}
                                            </div>
                                            <div className={styles.timelineTextWrapper}>
                                                <span
                                                    className={
                                                        idx === 0 ? styles.timelineTextActive : styles.timelineText
                                                    }
                                                >
                                                    {step.location}・{step.status}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={styles.timelineTime}>{formatStepTime(step.time)}</span>
                                    </div>
                                ))}
                            </div>

                            {!showAll && data.steps.length > 4 && <div className={styles.timelineGradient} />}
                        </div>

                        {data.steps.length > 4 && (
                            <button
                                className={styles.moreButton}
                                type="button"
                                onClick={() => setShowAll((prev) => !prev)}
                            >
                                <span>{showAll ? '접기' : '더보기'}</span>
                                <span className={`${styles.moreIcon} ${showAll ? styles.moreIconOpen : ''}`}>▼</span>
                            </button>
                        )}

                        <p className={styles.timelineNotice}>
                            • 배송 추적 서비스를 통해 제공받는 정보로 실 배송 현황과 차이가 있을 수 있습니다.
                        </p>
                    </div>
                </section>

                <hr className={styles.divider} />

                {/* FAQ 섹션 */}
                <section className={styles.card}>
                    <FaqItem
                        question="일반 배송 상품은 언제 배송되나요?"
                        answer={
                            <div className={styles.faqAnswerText}>
                                <p>
                                    일반배송은 브랜드마다 일정이 다르고 평일 기준으로 출고 됩니다. 출고 일정은 상품의
                                    상세페이지 출고 정보에서 확인 가능합니다.
                                </p>
                                <ul>
                                    <li>• 평일 기준 출고로 연휴 및 공휴일은 배송일에서 제외됩니다.</li>
                                    <li>• 무신사 스토어는 전 상품 100% 무료 배송입니다.</li>
                                    <li>• 배송 지연 상품의 경우 상품명에 지연으로 아이콘이 표시됩니다.</li>
                                    <li>• 출고 지연 발생 시에는 알림톡 또는 문자를 통해 안내해 드립니다.</li>
                                </ul>
                            </div>
                        }
                    />
                    <FaqItem
                        question="배송 완료 상품을 받지 못했어요."
                        answer={
                            <div className={styles.faqAnswerText}>
                                <p>
                                    택배사 배송 완료 이후 상품을 받지 못했거나 분실되었다면 아래 내용을 확인하여
                                    고객센터로 문의해주세요.
                                </p>
                                <ul>
                                    <li>• 상품이 배송 완료 상태인지 확인해주세요.</li>
                                    <li>• 주문 시 입력한 수령지 정보를 확인해주세요.</li>
                                    <li>• 위탁 장소(경비실, 문 앞 등)를 확인해주세요.</li>
                                    <li>• 택배사로부터 배송 완료 문자 또는 전화를 받았는지 확인해주세요.</li>
                                </ul>
                            </div>
                        }
                    />
                </section>
            </div>
        </main>
    )
}
