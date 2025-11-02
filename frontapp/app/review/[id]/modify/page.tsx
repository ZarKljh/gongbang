'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaPlus } from 'react-icons/fa'
import api from '@/app/utils/api'
import Link from 'next/link'

export default function ReviewModify() {
    const params = useParams()
    const router = useRouter()
    // const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태
    const [review, setReview] = useState({
        rating: 0,
        content: '',
    })

    useEffect(() => {
        if (!params?.id) return // id 없으면 fetch 안 함
        fetchReview()
    }, [params.id])

    const fetchReview = () => {
        fetch(`http://localhost:8090/api/v1/reviews/${params.id}`)
            .then((result) => result.json())
            .then((result) => setReview(result.data.review))
            .catch((err) => console.error(err))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const reviewToSend = {
            rating: review.rating,
            content: review.content,
        }

        const response = await fetch(`http://localhost:8090/api/v1/reviews/${params.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(reviewToSend),
        })

        if (response.ok) {
            alert('리뷰가 수정되었습니다.')
            router.push(`/review/${params.id}`)
        } else {
            alert('리뷰 수정에 실패했습니다.')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const newValue = name === 'rating' ? Number(value) : value
        setReview((prev) => ({ ...prev, [name]: newValue }))
    }

    return (
                <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 20px',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            {/* 왼쪽: 리뷰 작성 섹션 */}
            <div style={{ width: '70%' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>리뷰 등록</h2>

                <form onSubmit={handleSubmit}>
                    {/* 별점 */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            별점을 선택해주세요.
                        </p>
                        <div
                            style={{
                                borderBottom: '1px solid #ccc',
                                paddingBottom: '10px',
                                marginBottom: '20px',
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <FaStar
                                    key={num}
                                    size={40}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'color 0.2s ease',
                                        marginRight: '8px',
                                    }}
                                    color={num <= review.rating ? '#FFD700' : '#E0E0E0'}
                                    onClick={() =>
                                        setReview((prev) => ({
                                            ...prev,
                                            rating: num,
                                        }))
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {/* 후기 작성 */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>수정할 내용을 입력해주세요.</p>
                        <textarea
                            name="content"
                            minLength={5}
                            maxLength={300}
                            onChange={handleChange}
                            value={review.content}
                            placeholder="5자 이상 입력해주세요."
                            style={{
                                width: '90%',
                                height: '200px',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                padding: '10px',
                                resize: 'none',
                                backgroundColor: '#f5f5f5',
                            }}
                        />
                    </div>

                    {/* 이미지 업로드 + 등록 버튼 */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #ccc',
                            paddingTop: '20px',
                        }}
                    >
                        <Link
                            href="#"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'black',
                            }}
                        >
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    border: '2px solid #bfbfbf',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '24px',
                                    borderRadius: '6px',
                                    marginRight: '10px',
                                    color: '#666',
                                }}
                            >
                                <FaPlus />
                            </div>
                            <span style={{ fontSize: '16px' }}>이미지 업로드하기</span>
                        </Link>

                        <input
                            type="submit"
                            value="리뷰 수정하기"
                            style={{
                                backgroundColor: '#AD9263',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                marginRight: '10px'
                            }}
                        />
                    </div>
                </form>
            </div>

            {/* 오른쪽: 안내 섹션 */}
            <div
                style={{
                    width: '25%',
                    backgroundColor: '#E8E8E8',
                    borderRadius: '8px',
                    padding: '20px',
                    color: '#555',
                    fontSize: '14px',
                    lineHeight: '1.6',
                }}
            >
                <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>이런 후기는 삭제될 수 있어요.</p>
                <p>
                    ~~~~~~~~~~~~~~~~~~~~
                    <br />
                    이 부분 나중에 수정
                </p>
            </div>
        </div>
    )
}
