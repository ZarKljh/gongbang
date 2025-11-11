'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Link from 'next/link'

export default function ReviewDetail() {
    const params = useParams()
    const router = useRouter()
    const [review, setReview] = useState({})
    const [currentUserId, setCurrentUserId] = useState(null)
    const [selectedImageIndex, setSelectedImageIndex] = useState(null) // ✅ index 기반으로 변경

    useEffect(() => {
        checkLoginStatus()
        fetchReviewDetail()
    }, [params.id])

    // 로그인 정보 확인
    const checkLoginStatus = async () => {
        try {
            const res = await fetch('http://localhost:8090/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                setCurrentUserId(data?.data?.id || null)
            }
        } catch (err) {
            console.error('로그인 확인 실패:', err)
        }
    }

    // 리뷰 상세 불러오기
    const fetchReviewDetail = async () => {
        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${params.id}`)
            const data = await res.json()
            if (res.ok) setReview(data.data)
        } catch (err) {
            console.error('리뷰 상세 조회 실패:', err)
        }
    }

    // ESC로 팝업 닫기
    useEffect(() => {
        const handleEsc = (e) => e.key === 'Escape' && setSelectedImageIndex(null)
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    // 이전/다음 이미지 이동
    const handlePrevImage = (e) => {
        e.stopPropagation()
        setSelectedImageIndex((prev) =>
            prev > 0 ? prev - 1 : review.imageUrls.length - 1
        )
    }

    const handleNextImage = (e) => {
        e.stopPropagation()
        setSelectedImageIndex((prev) =>
            prev < review.imageUrls.length - 1 ? prev + 1 : 0
        )
    }

    const currentImage =
        selectedImageIndex !== null ? review.imageUrls[selectedImageIndex] : null

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
            {/* 왼쪽: 리뷰 상세 */}
            <div style={{ width: '70%' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>리뷰 상세보기</h2>

                {/* 작성자 정보 */}
                <div
                    style={{
                        fontSize: '15px',
                        color: '#555',
                        marginBottom: '15px',
                        borderBottom: '1px solid #ccc',
                        paddingBottom: '8px',
                    }}
                >
                    <strong style={{ color: '#333' }}>
                        {review.userNickName || '익명'}
                    </strong>{' '}
                    · 작성일:{' '}
                    {review.createdDate
                        ? new Date(review.createdDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                          })
                        : '-'}
                </div>

                {/* 리뷰 이미지 섹션 */}
                {review.imageUrls && review.imageUrls.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            marginBottom: '25px',
                        }}
                    >
                        {review.imageUrls.map((url, i) => (
                            <img
                                key={i}
                                src={
                                    url.startsWith('data:')
                                        ? url
                                        : `http://localhost:8090${url}`
                                }
                                alt={`리뷰 이미지 ${i + 1}`}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease',
                                }}
                                onClick={() => setSelectedImageIndex(i)} // ✅ index 저장
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = 'scale(1.05)')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = 'scale(1)')
                                }
                            />
                        ))}
                    </div>
                )}

                {/* ⭐ 별점 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px',
                    }}
                >
                    {[1, 2, 3, 4, 5].map((num) => (
                        <FaStar
                            key={num}
                            size={26}
                            color={num <= review.rating ? '#FFD700' : '#E0E0E0'}
                            style={{ marginRight: '4px' }}
                        />
                    ))}
                    <span style={{ marginLeft: '10px', color: '#777' }}>
                        {review.rating} / 5
                    </span>
                </div>

                {/* 📜 내용 */}
                <div
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa',
                        padding: '15px',
                        minHeight: '150px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '30px',
                    }}
                >
                    {review.content || '리뷰 내용이 없습니다.'}
                </div>

                {/* ✏️ 버튼 영역 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {Number(currentUserId) === Number(review.userId) && (
                        <button
                            onClick={() =>
                                router.push(`/review/${params.id}/modify`)
                            }
                            style={{
                                backgroundColor: '#AD9263',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: '0.2s',
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = '#8f744d')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = '#AD9263')
                            }
                        >
                            리뷰 수정하기
                        </button>
                    )}

                    <Link
                        href="/review"
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#ddd',
                            color: '#333',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 'bold',
                        }}
                    >
                        ← 목록으로 돌아가기
                    </Link>
                </div>
            </div>

            {/* ✅ 팝업 모달 (이미지 확대 보기) */}
            {selectedImageIndex !== null && (
                <div
                    onClick={() => setSelectedImageIndex(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        cursor: 'zoom-out',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            maxWidth: '70%',
                            maxHeight: '80%',
                        }}
                    >
                        <img
                            src={
                                currentImage?.startsWith('data:')
                                    ? currentImage
                                    : `http://localhost:8090${currentImage}`
                            }
                            alt="확대 이미지"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: '8px',
                            }}
                        />

                        {/* 닫기 버튼 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImageIndex(null)
                            }}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        >
                            <FaTimes />
                        </button>

                        {/* 이전 / 다음 버튼 */}
                        {review.imageUrls.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '-60px',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                    }}
                                >
                                    <FaChevronLeft />
                                </button>

                                <button
                                    onClick={handleNextImage}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '-60px',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                    }}
                                >
                                    <FaChevronRight />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
