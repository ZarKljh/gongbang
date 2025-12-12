'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import styles from '../PayResult.module.css'

export default function PayFailPage() {
    const searchParams = useSearchParams()
    const code = searchParams.get('code')
    const message = searchParams.get('message')

    return (
        <div className={styles.resultWrap}>
            <h1 className={styles.fail}>결제 실패 ❌</h1>

            <div className={styles.box}>
                <p>
                    <strong>에러 코드:</strong> {code}
                </p>
                <p>
                    <strong>사유:</strong> {message}
                </p>
            </div>

            <a href="/" className={styles.homeBtn}>
                홈으로 돌아가기
            </a>
        </div>
    )
}
