'use client'

import { useState } from 'react'
import api from '@/app/utils/api'
import { FcManager } from 'react-icons/fc'
import '@/app/components/product/detail/styles/ReviewSummary.css'

export default function ReviewSummary({ productId }) {
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSummaryClick = async () => {
        setLoading(true)
        setSummary('')

        if (loading) return

        try {
            const res = await api.get('/reviews/summary', {
                params: { productId },
            })

            if (res.data?.resultCode?.startsWith('200')) {
                setSummary(res.data.data)
            } else {
                alert(res.data?.msg || '요약 실패')
            }
        } catch (e) {
            console.error(e)
            alert('요약 호출 중 오류 발생')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="review-summary-container">
            <button className="review-summary-btn" onClick={handleSummaryClick} disabled={loading}>
                {loading ? '요약 생성 중...' : 'AI 리뷰 요약 보기'}
            </button>

            {summary && (
                <div className="review-summary-box">
                    <strong>
                        <FcManager size={24} /> AI 요약 결과 (Google Gemini 기반)
                    </strong>
                    <br />
                    {summary}
                </div>
            )}
        </div>
    )
}
