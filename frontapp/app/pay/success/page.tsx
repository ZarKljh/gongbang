'use client'

import { useSearchParams } from 'next/navigation'
import styles from '../PayResult.module.css'

export default function PaySuccessPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const paymentKey = searchParams.get('paymentKey')

    return (
        <div className={styles.resultWrap}>
            <h1 className={styles.success}>결제 완료 🎉</h1>

            <div className={styles.box}>
                <p>
                    <strong>주문번호:</strong> {orderId}
                </p>
                <p>
                    <strong>결제금액:</strong> {Number(amount).toLocaleString()}원
                </p>
                <p>
                    <strong>paymentKey:</strong> {paymentKey}
                </p>
            </div>

            <a href="/" className={styles.homeBtn}>
                홈으로 돌아가기
            </a>
        </div>
    )
}
