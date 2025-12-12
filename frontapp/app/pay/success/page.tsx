'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useConfirmOrder } from '@/app/utils/api/order'
import styles from '../PayResult.module.css'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { mutate: confirmOrder, data, isPending, isError, error } = useConfirmOrder()

    // 쿼리 파라미터 상태
    const [orderId, setOrderId] = useState<string | null>(null)
    const [amount, setAmount] = useState<number | null>(null)
    const [paymentKey, setPaymentKey] = useState<string | null>(null)
    const [loaded, setLoaded] = useState(false)

    // 1) 마운트 시점에 쿼리에서 파라미터 꺼내기
    useEffect(() => {
        const qOrderId = searchParams.get('orderId')
        const qPaymentKey = searchParams.get('paymentKey')
        const qAmountStr = searchParams.get('amount')

        setOrderId(qOrderId)
        setPaymentKey(qPaymentKey)
        setAmount(qAmountStr ? Number(qAmountStr) : null)

        setLoaded(true)
    }, [searchParams])

    // 2) 파라미터가 준비되면 서버로 승인 요청
    useEffect(() => {
        if (!loaded) return
        if (!orderId || !paymentKey || !amount) {
            alert('결제 정보가 올바르지 않습니다.')
            router.push('/')
            return
        }

        confirmOrder({
            orderId,
            paymentKey,
            amount,
        })

        console.log(`1${orderId}2${paymentKey}3${amount}`)
    }, [loaded, orderId, paymentKey, amount, confirmOrder, router])

    // 3) 로딩 전: 아무것도 안 보여주기
    if (!loaded) {
        return (
            <div className={styles.resultWrap}>
                <h1 className={styles.success}>결제 정보 확인 중...</h1>
            </div>
        )
    }

    // 4) 파라미터 자체가 없을 때
    if (!orderId || !paymentKey || !amount) {
        return (
            <div className={styles.resultWrap}>
                <h1 className={styles.fail}>잘못된 접근입니다.</h1>
                <a href="/" className={styles.homeBtn}>
                    홈으로 돌아가기
                </a>
            </div>
        )
    }

    if (isPending) {
        return (
            <div className={styles.resultWrap}>
                <h1 className={styles.success}>결제 승인 중입니다...</h1>
                <p>잠시만 기다려 주세요.</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className={styles.resultWrap}>
                <h1 className={styles.fail}>결제 승인에 실패했어요 😢</h1>
                <p>{(error as Error).message}</p>
                <a href="/" className={styles.homeBtn}>
                    홈으로 돌아가기
                </a>
            </div>
        )
    }

    // 서버에서 온 결과
    const result = data?.data

    return (
        <div className={styles.resultWrap}>
            <h1 className={styles.success}>결제 완료 🎉</h1>

            <div className={styles.box}>
                <p>
                    <strong>주문번호:</strong> {result?.orderId ?? orderId}
                </p>
                <p>
                    <strong>결제금액:</strong> {(result?.amount ?? amount)?.toLocaleString()}원
                </p>
                <p>
                    <strong>paymentKey:</strong> {result?.paymentKey ?? paymentKey}
                </p>
                <p>
                    <strong>결제상태:</strong> {result?.status ?? 'DONE'}
                </p>
            </div>

            <button type="button" className={styles.homeBtn} onClick={() => router.push('/personal?tab=orders')}>
                주문 내역 보러가기
            </button>
        </div>
    )
}
