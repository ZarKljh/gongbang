'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaPlus } from 'react-icons/fa'
import Link from 'next/link'

export default function ReviewDetail() {
    const params = useParams()
    const [review, setReview] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [roleType, setRoleType] = useState(null)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)

    useEffect(() => {
        checkLoginStatus()
    }, [])

    useEffect(() => {
        checkLoginStatus()
        fetchReviewDetail()
    }, [params.id])

    // 로그인 여부 확인
        const checkLoginStatus = async () => {
        try {
            const res = await fetch('http://localhost:8090/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
            })

            if (res.ok) {
                const data = await res.json()
                console.log('🧭 currentUserId:', currentUserId)
                console.log('✅ 로그인된 사용자:', data.data)
                console.log('✅ 역할:', data?.data?.role)
                console.log('📡 로그인 응답 전체:', data)

                setIsLoggedIn(true)
                setCurrentUserId(data.data.id)
                setRoleType(data?.data?.role || null)
            } else {
                setIsLoggedIn(false)
                setRoleType(null)
            }
        } catch (err) {
            console.error('로그인 상태 확인 실패', err)
            setIsLoggedIn(false)
            setRoleType(null)
            setCurrentUserId(null)
        }
    }

    // ✅ 리뷰 상세 조회
    const fetchReviewDetail = async () => {
        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${params.id}`)
            const data = await res.json()
            console.log('📦 리뷰 단건 조회 결과:', data)
             setReview(data.data)
        } catch (err) {
            console.error('❌ 리뷰 상세 조회 실패:', err)
        }
    }

    // ✅ 리뷰 수정 버튼 클릭
    const handleModifyClick = () => {
        if (!isLoggedIn) {
            if (confirm('리뷰를 수정하려면 로그인이 필요합니다. 로그인 하시겠습니까?')) {
                window.location.href = '/auth/login'
            }
            return
        }

        if (roleType !== 'USER') {
            alert('작성자만 리뷰를 수정할 수 있습니다.')
            return
        }

        window.location.href = `/review/${params.id}/modify`
    }

    return (
        <div
            style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '40px 20px',
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            {/* 왼쪽: 리뷰 상세 내용 */}
            <div style={{ width: '70%' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>리뷰 상세보기</h2>

                {/* 제목 구분선 */}
                <div
                    style={{
                        borderBottom: '1px solid #ccc',
                        paddingBottom: '10px',
                        marginBottom: '20px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                        }}
                    >
                        {/* 이미지 업로드 (링크로 대체) */}
                        <Link
                            href="#"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'black',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    width: '100px',
                                    height: '100px',
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
                                <p>img</p>
                            </div>
                            {/* <span style={{ fontSize: '16px' }}>이미지 업로드 보기 & 수정하기</span> */}
                        </Link>
                        <Link
                            href="#"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'black',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    width: '100px',
                                    height: '100px',
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
                                <p>img</p>
                            </div>
                            {/* <span style={{ fontSize: '16px' }}>이미지 업로드 보기 & 수정하기</span> */}
                        </Link>
                        <Link
                            href="#"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'black',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    width: '100px',
                                    height: '100px',
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
                                <p>img</p>
                            </div>
                            {/* <span style={{ fontSize: '16px' }}>이미지 업로드 보기 & 수정하기</span> */}
                        </Link>
                    </div>
                    <p>   
                        <strong>작성일:</strong> {review.createdDate}
                        <strong> / 수정일:</strong> {review.modifiedDate}
                    </p>
                </div>

                {/* ⭐ 별점 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px',
                        borderBottom: '1px solid #ccc',
                        paddingBottom: '10px',
                    }}
                >
                    {[1, 2, 3, 4, 5].map((num) => (
                        <FaStar
                            key={num}
                            size={40}
                            color={num <= review.rating ? '#FFD700' : '#E0E0E0'}
                            style={{ marginRight: '8px' }}
                        />
                    ))}
                    <small style={{ marginLeft: '6px', color: '#555' }}>{review.rating} / 5</small>
                </div>

                {/* 내용 */}
                <div
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: '#f5f5f5',
                        marginBottom: '20px',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {review.content || '리뷰 내용이 없습니다.'}
                </div>

                {/* 수정 버튼 (USER만 표시) */}
                 {Number(currentUserId) === Number(review.userId) && (
                    <button
                        onClick={() => handleModifyClick(review.reviewId)}
                        style={{
                            backgroundColor: '#AD9263',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        리뷰 수정하기
                    </button>

                    
                )}

                <br />
                <Link href="/review" style={{ display: 'inline-block', marginTop: '20px' }}>
                    ← 목록으로 돌아가기
                </Link>
            </div>

            {/* 오른쪽: 안내 영역
      <div
        style={{
          width: '25%',
          backgroundColor: '#E8E8E8',
          borderRadius: '8px',
          padding: '20px',
          color: '#555',
          fontSize: '14px',
          lineHeight: '1.6',
          height: 'fit-content',
        }}
      >
        <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>
          이런 후기는 삭제될 수 있어요.
        </p>
        <p>
          사용을 해보셨다면?
          <br />
          사용하면서 느낀 솔직한 후기를 남겨주세요 😊
        </p>
      </div> */}
        </div>
    )
}
