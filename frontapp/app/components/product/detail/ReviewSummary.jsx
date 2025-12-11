"use client"

import { useState } from "react"
import api from '@/app/utils/api'

export default function ReviewSummary({ productId }) {
    const [summary, setSummary] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSummaryClick = async () => {
        setLoading(true)
        setSummary("")

        try {
            const res = await api.get('/reviews/summary', {
                params: { productId },
            })

            if (res.data?.resultCode?.startsWith("200")) {
                setSummary(res.data.data)
            } else {
                alert(res.data?.msg || "요약 실패")
            }
        } catch (e) {
            console.error(e)
            alert("요약 호출 중 오류 발생")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ marginTop: "20px" }}>
            <button
                onClick={handleSummaryClick}
                disabled={loading}
                style={{
                    padding: "10px 18px",
                    backgroundColor: "#dac0a3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                }}
            >
                {loading ? "요약 생성 중..." : "AI 리뷰 요약 보기"}
            </button>

            {summary && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "12px",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.6",
                    }}
                >
                    <strong>요약 결과</strong>
                    <br />
                    {summary}
                </div>
            )}
        </div>
    )
}
