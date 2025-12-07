'use client'

import '@/app/review/styles/ReviewDetail.css'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaStar, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import api from '@/app/utils/api'
import Link from 'next/link'
import ReportButton from '@/app/admin/components/ReportButton'

export default function ReviewDetail() {
    const params = useParams()
    const router = useRouter()
    const [review, setReview] = useState(null)
    const [reviews, setReviews] = useState([])
    const [currentUserId, setCurrentUserId] = useState(null)
    const [selectedImageIndex, setSelectedImageIndex] = useState(null) // ✅ index 기반으로 변경
    const [slideDirection, setSlideDirection] = useState(null)

    const searchParams = useSearchParams()
    const [product, setProduct] = useState(null)

    const productIdStr = searchParams.get('productId')
    const productId = productIdStr ? Number(productIdStr) : null

    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const [roleType, setRoleType] = useState<string | null>(null)

    // 모달 이미지 확대 축소
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        checkLoginStatus()
        fetchReviewDetail()
    }, [params.id])

    // ✅ 파라미터에서 categoryId, subId 받아서 상태로 설정
    useEffect(() => {
        const catIdStr = searchParams.get('categoryId')
        const subIdStr = searchParams.get('subId') ?? '0'
        if (!catIdStr) return

        const catId = Number(catIdStr)
        const subId = Number(subIdStr)

        if (!Number.isFinite(catId) || catId <= 0) return

        // subId가 0이면 API에서 최소값 조회
        if (subId === 0) {
            api.get(`category/${catId}/min`)
                .then((res) => {
                    const minSubId = res.data?.data

                    onClickSubCategory(catId, minSubId)
                })
                .catch((err) => {
                    console.error(' sub-min 값 검색 실패:', err)
                })
        }

        // subId가 0이 아니면 그대로 사용
        else {
            onClickSubCategory(catId, subId)
        }
    }, [searchParams])

    // 모달 열릴때 zoom 초기화
    useEffect(() => {
        if (selectedImageIndex !== null) {
            const timer = setTimeout(() => {
                setZoom(1)
            }, 200) // 슬라이드 종료 후 실행

            return () => clearTimeout(timer)
        }
    }, [selectedImageIndex])

    // 로그인 정보 확인
    const checkLoginStatus = async () => {
        try {
            const res = await fetch('http://localhost:8090/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                setIsLoggedIn(true)
                setCurrentUserId(data?.data?.id || null)
            }
        } catch (err) {
            console.error('로그인 확인 실패:', err)
            setIsLoggedIn(false)
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

    const handleDeleteClick = async (reviewId: number) => {
        try {
            if (!isLoggedIn) {
                if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
                    window.location.href = '/auth/login'
                }
                return
            }

            if (!confirm('리뷰를 삭제하시겠습니까?')) return

            // 리뷰 삭제 전 미리 저장
            const productId = review?.productId

            const token = localStorage.getItem('accessToken') // 관리자 토큰 가져오기

            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })

            const data = await res.json()
            console.log('🗑️ 삭제 응답:', data)

            if (res.ok && data.resultCode === '200') {
                alert('리뷰가 삭제되었습니다.')
                // 목록에서 제거
                setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId))

                // 상품 상세 이동
                window.location.href = `/product/list/detail?productId=${productId}`

                return
            } else if (data.resultCode === '403') {
                alert('삭제 권한이 없습니다.')
            } else if (data.resultCode === '400') {
                alert('리뷰가 존재하지 않습니다.')
            } else {
                alert('삭제 실패. 다시 시도해주세요.')
            }
        } catch (err) {
            console.error('❌ 서버 오류:', err)
            alert('서버 오류로 삭제 실패')
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
        setSlideDirection('left')
        setTimeout(() => {
            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : review.imageUrls.length - 1))
        }, 150) // 애니메이션 시간만큼 딜레이
    }

    const handleNextImage = (e) => {
        e.stopPropagation()
        setSlideDirection('right')
        setTimeout(() => {
            setSelectedImageIndex((prev) => (prev < review.imageUrls.length - 1 ? prev + 1 : 0))
        }, 150)
    }

    const currentImage = selectedImageIndex !== null ? review.imageUrls[selectedImageIndex] : null

    if (!review) {
        return null
    }

    const handleWheelZoom = (e) => {
        e.preventDefault()
        if (e.deltaY < 0) {
            // 위로 스크롤 → 확대
            setZoom((z) => Math.min(z + 0.2, 3))
        } else {
            // 아래로 스크롤 → 축소
            setZoom((z) => Math.max(z - 0.2, 1))
        }
    }

    const handleDoubleClickZoom = (e) => {
        e.preventDefault()
        setZoom((z) => (z >= 2 ? 1 : 2)) // 1배 ↔ 2배 토글
    }

    return (
        <div className="review-detail-wrapper">
            <div className="review-detail-container">
                {/* 리뷰 상세 */}
                <div className="review-detail-left">
                    <Link
                        href={{
                            pathname: '/product/list/detail',
                            query: { productId: review?.productId },
                        }}
                        className="review-back-btn"
                    >
                        ← 목록으로
                    </Link>

                    <h2 className="review-detail-title">리뷰 상세보기</h2>

                    {/* 작성자 정보 */}
                    <div className="review-author-box">
                        <div className="review-header">
                            <img
                                className="review-user-avatar"
                                src={
                                    review.profileImageUrl
                                        ? `http://localhost:8090${review.profileImageUrl}`
                                        : '/images/default_profile.jpg'
                                }
                                alt="프로필"
                            />
                            {/* </div> */}
                            <div className="review-user-info">
                                <div className="review-author-name">{review.createdBy}</div>
                                <div>{review.createdDate}</div>
                            </div>
                            
                        </div>
                    </div>

                    {/* 리뷰 이미지 섹션 */}
                    {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="review-image-list">
                            {review.imageUrls.map((url, i) => (
                                <img
                                    key={i}
                                    src={url.startsWith('data:') ? url : `http://localhost:8090${url}`}
                                    alt={`리뷰 이미지 ${i + 1}`}
                                    className="review-image-item"
                                    onClick={() => setSelectedImageIndex(i)}
                                />
                            ))}
                        </div>
                    )}

                    {/* 별점 */}
                    <div className="review-rating-box">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <FaStar
                                key={num}
                                size={26}
                                color={num <= review.rating ? '#FFD700' : '#E0E0E0'}
                                style={{ marginRight: '4px' }}
                            />
                        ))}
                        <span className="review-rating-text">{review.rating} / 5</span> &nbsp; &nbsp; <div className="report-btn">
                                <ReportButton targetType="POST" targetId={review.review_id} />
                            </div>
                    </div>

                    {/* 내용 */}
                    
                    <div className="review-content-box-D">{review.content || '리뷰 내용이 없습니다.'}</div>

                    {/* 버튼 영역 */}
                    <div className="review-action-buttons">
                        {Number(currentUserId) === Number(review.userId) && (
                            <button
                                onClick={() => router.push(`/review/${params.id}/modify`)}
                                className="review-modify-btn"
                            >
                                리뷰 수정하기
                            </button>
                        )}

                        {(Number(currentUserId) === Number(review.userId) || roleType === 'ADMIN') && (
                            <button className="review-delete-btn" onClick={() => handleDeleteClick(review.reviewId)}>
                                삭제
                            </button>
                        )}
                    </div>
                </div>

                {/* 팝업 모달 */}
                {selectedImageIndex !== null && (
                    <div className="review-modal-overlay" onClick={() => setSelectedImageIndex(null)}>
                        <div className="review-modal-wrapper">
                            <div className="review-modal-image-box">
                                <img
                                    src={
                                        currentImage?.startsWith('data:')
                                            ? currentImage
                                            : `http://localhost:8090${currentImage}`
                                    }
                                    alt="확대 이미지"
                                    className="review-modal-image"
                                    onWheel={handleWheelZoom}
                                    onDoubleClick={handleDoubleClickZoom}
                                    style={{
                                        transform: `scale(${zoom})`,
                                        cursor: zoom > 1 ? 'zoom-out' : 'zoom-in',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation() // 부모 overlay 클릭 방지
                                        setZoom((prev) => (prev === 1 ? 1.8 : 1)) // 1 ↔ 1.8 토글
                                    }}
                                />

                                <button
                                    className="review-modal-close"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedImageIndex(null)
                                    }}
                                >
                                    <FaTimes />
                                </button>

                                {review.imageUrls.length > 1 && (
                                    <>
                                        <button
                                            className="review-modal-prev"
                                            onClick={(e) => {
                                                e.stopPropagation() // 🔥 모달 닫힘 방지
                                                handlePrevImage(e)
                                            }}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            className="review-modal-next"
                                            onClick={(e) => {
                                                e.stopPropagation() // 🔥 모달 닫힘 방지
                                                handlePrevImage(e)
                                            }}
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
