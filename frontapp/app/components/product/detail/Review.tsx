'use client'
import { useEffect, useState, useRef } from 'react'
import { FaThumbsUp, FaRegThumbsUp, FaStar } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import 'swiper/css/navigation'
import '@/app/components/product/detail/styles/review.css'

export default function detail() {
    // ================= 리뷰 =================
    const [reviews, setReviews] = useState([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null)
    const [reviewComment, setReviewComment] = useState('') // null → ''
    const [comments, setComments] = useState({})
    // 리뷰 좋아요
    const [likeCounts, setLikeCounts] = useState<Record<number, number>>({})
    const [liked, setLiked] = useState<Record<number, boolean>>({}) // 좋아요 눌린 상태 체크용

    const [avgRating, setAvgRating] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalpages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const reviewTopRef = useRef<HTMLDivElement>(null)
    const [roleType, setRoleType] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const prevRef = useRef<HTMLDivElement | null>(null)
    const nextRef = useRef<HTMLDivElement | null>(null)
    const [sortType, setSortType] = useState<'date_desc' | 'like_desc' | 'rating_desc'>('date_desc')
    const [keyword, setKeyword] = useState('')

    // 포토 리뷰 슬라이드 인스턴스 저장
    const [swiperRef, setSwiperRef] = useState<any>(null)

    // 포토 리뷰 가져오기
    const [photoReviews, setPhotoReviews] = useState<{ id: number; img: string; title: string }[]>([])

    // 상품Id 기준 리뷰 가져오기
    const searchParams = useSearchParams()
    const [productId, setProductId] = useState<number | null>(null)

    const router = useRouter()

    // searchParams 감지해서 productId 채우기 (하나로 통합)
    useEffect(() => {
        const productIdStr = searchParams.get('productId')
        if (!productIdStr) return

        const id = Number(productIdStr)
        if (!Number.isFinite(id) || id <= 0) return

        setProductId(id)
    }, [searchParams])

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

                setIsLoggedIn(true)
                setCurrentUserId(data.data.id)
                setRoleType(data?.data?.role || null)
            } else {
                setIsLoggedIn(false)
                setRoleType(null)
                setCurrentUserId(null)
            }
        } catch (err) {
            console.error('로그인 상태 확인 실패', err)
            setIsLoggedIn(false)
            setRoleType(null)
            setCurrentUserId(null)
        }
    }

    // 로그인 체크는 최초 1번만
    useEffect(() => {
        checkLoginStatus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 리뷰 목록 조회
    const fetchReviews = async (productId: number, page = 0, sort: string) => {
        try {
            const res = await fetch(
                `http://localhost:8090/api/v1/reviews?productId=${productId}&page=${page}&sort=${sort}&keyword=${encodeURIComponent(
                    keyword,
                )}`,
                {
                    method: 'GET',
                    credentials: 'omit', // 쿠키 없이 요청 (비로그인도 가능)
                },
            )

            const data = await res.json()
            const fetchedReviews = data.data.reviews || []

            setReviews(fetchedReviews)
            setCurrentPage(data.data.currentPage ?? 0)
            setTotalpages(data.data.totalPages ?? 0)
            console.log('정렬 요청, sortType:', sort, 'page:', page)

            // 리뷰별 좋아요 카운트 초기화
            const initialCounts: Record<number, number> = {}
            fetchedReviews.forEach((r) => {
                initialCounts[r.reviewId] = r.reviewLike
            })
            setLikeCounts(initialCounts)

            // 각 리뷰별 댓글도 함께 조회
            fetchedReviews.forEach((review) => fetchComment(review.reviewId))
        } catch (err) {
            console.error('리뷰 목록 조회 실패:', err)
        }
    }

    // productId / currentPage / sortType 바뀔 때마다 리뷰 재조회
    useEffect(() => {
        if (!productId) return
        fetchReviews(productId, currentPage, sortType)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, currentPage, sortType])

    // 페이지 버튼 클릭 시 상단 이동
    const scrollToTop = () => {
        reviewTopRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handlePageChange = (pageNumber: number) => {
        if (!productId) return
        setCurrentPage(pageNumber)

        // 스크롤 이동 — DOM 업데이트 후 실행되도록 약간의 delay 추가
        setTimeout(() => {
            scrollToTop()
        }, 100)
    }

    const fetchPhotoReviews = async (productId) => {
        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/photo?productId=${productId}`)

            const data = await res.json()

            if (res.ok) {
                const pr = data.data.map((r) => ({
                    id: r.reviewId,
                    img: `http://localhost:8090${r.imageUrl}`, // 백엔드 필드명 맞춰
                    title: r.content.length > 15 ? r.content.slice(0, 15) + '...': r.content,
                }))

                setPhotoReviews(pr)
            }
        } catch (e) {
            console.error('전체 포토 리뷰 조회 실패', e)
        }
    }

    // 포토 슬라이드 swiper 준비 된 후 네비게이션 연결
    useEffect(() => {
        if (!swiperRef) return
        if (!prevRef.current || !nextRef.current) return

        swiperRef.params.navigation.prevEl = prevRef.current
        swiperRef.params.navigation.nextEl = nextRef.current

        swiperRef.navigation.init()
        swiperRef.navigation.update()
    }, [swiperRef])

    useEffect(() => {
        if (!productId) return
        fetchPhotoReviews(productId) // 전체 포토 리뷰 불러오기
    }, [productId])

    // 평균 별점
    useEffect(() => {
        if (!productId) return // productId가 있을 때 실행

        const fetchAverage = async () => {
            try {
                const res = await fetch(`http://localhost:8090/api/v1/reviews/average/${productId}`)
                const data = await res.json()
                console.log('⭐ 평균별점 응답:', data)
                setAvgRating(data?.data?.avgRating || 0)
                setTotalCount(data?.data?.totalCount || 0)
            } catch (err) {
                console.error('평균 별점 불러오기 실패:', err)
            }
        }
        fetchAverage()
    }, [productId])

    // 별점 그래프
    const [ratingData, setRatingData] = useState<Record<number, number>>({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    })

    useEffect(() => {
        if (!productId) return

        const fetchRatingGroup = async () => {
            try {
                const res = await fetch(`http://localhost:8090/api/v1/reviews/rating-group/${productId}`)
                const data = await res.json()

                if (res.ok) {
                    const counts = data.data

                    const total = Object.values(counts).reduce((a: number, b: number) => a + b, 0)

                    // 퍼센트로 변환
                    const percentData: Record<number, number> = {}
                    for (let i = 1; i <= 5; i++) {
                        percentData[i] = total === 0 ? 0 : Math.round((counts[i] / total) * 100)
                    }

                    setRatingData(percentData)
                }
            } catch (err) {
                console.error('별점 분포 불러오기 실패:', err)
            }
        }

        fetchRatingGroup()
    }, [productId])

    // 정렬 요청
    const handleSortChange = (type: '최신순' | '추천순' | '별점순') => {
        if (!productId) return

        let newSort: 'date_desc' | 'like_desc' | 'rating_desc' = 'date_desc'
        if (type === '추천순') newSort = 'like_desc'
        else if (type === '별점순') newSort = 'rating_desc'

        setSortType(newSort)
        setCurrentPage(0) // 정렬 바꾸면 1페이지로 이동
    }

    // 검색
    const handleSearch = async () => {
        if (!productId) return

        console.log('검색 버튼 클릭, keyword =', keyword)
        // keyword는 state로 관리되고 있으니, 여기서는 현재 sortType 그대로 0페이지부터 조회

        setCurrentPage(0)

        fetchReviews(productId, 0, sortType)
    }

    // 댓글 조회
    const fetchComment = async (reviewId: number) => {
        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}/comments`)
            if (!res.ok) return
            const data = await res.json()
            setComments((prev) => ({
                ...prev,
                [reviewId]: data.data || null,
            }))
        } catch (err) {
            console.error(`댓글(${reviewId}) 조회 실패:`, err)
        }
    }

    // 리뷰 작성 버튼
    const handleCreateClick = async () => {
        if (!isLoggedIn) {
            if (confirm('리뷰를 작성하려면 로그인이 필요합니다. 로그인 하시겠습니까?')) {
                window.location.href = '/auth/login'
            }
        } else {
            window.location.href = `/review/create?productId=${productId}`
        }
    }

    // 리뷰 좋아요 버튼
    const handleLikeClick = async (reviewId: number) => {
        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}/like`, {
                method: 'POST',
                credentials: 'include',
            })

            if (!isLoggedIn) {
                if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
                    window.location.href = '/auth/login'
                }
            }

            const data = await res.json()

            // 요청 실패 시 (서버 오류등)
            if (!data || !data.msg) {
                console.error('좋아요 요청 실패:', data)
                return
            }

            // 좋아요 추가 201
            if (data.resultCode === '201') {
                setLikeCounts((prev) => ({
                    ...prev,
                    [reviewId]: (prev[reviewId] ?? 0) + 1,
                }))
                setLiked((prev) => ({
                    ...prev,
                    [reviewId]: true,
                }))
            }

            // 좋아요 취소 202
            else if (data.resultCode === '202') {
                setLikeCounts((prev) => ({
                    ...prev,
                    [reviewId]: Math.max(0, (prev[reviewId] ?? 1) - 1),
                }))
                setLiked((prev) => ({
                    ...prev,
                    [reviewId]: false,
                }))
            }
        } catch (err) {
            console.error('좋아요 요청 실패:', err)
        }
    }

    // 댓글 등록 버튼
    const handleCommentSubmit = async (reviewId: number) => {
        if (!reviewComment.trim()) {
            alert('댓글 내용을 입력해주세요.')
            return
        }

        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    review_id: reviewId,
                    review_comment: reviewComment,
                }),
            })

            if (res.ok) {
                alert('댓글이 등록되었습니다.')
                setReviewComment('')
                setActiveCommentBox(null)
                fetchComment(reviewId) // 등록 후 갱신
            } else if (res.status === 401) {
                alert('로그인이 필요합니다.')
                window.location.href = '/auth/login'
            } else {
                alert('댓글 등록 실패')
            }
        } catch (err) {
            console.error('댓글 등록 에러:', err)
        }
    }

    // 댓글 수정
    const handleCommentEdit = async (reviewId: number, commentId: number) => {
        if (!reviewComment.trim()) {
            alert('수정할 내용을 입력해주세요.')
            return
        }

        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    review_comment: reviewComment,
                }),
            })

            if (res.ok) {
                alert('댓글이 수정되었습니다.')
                setReviewComment('')
                setActiveCommentBox(null)
                fetchComment(reviewId) // 수정 후 다시 불러오기
            } else if (res.status === 401) {
                alert('로그인이 필요합니다.')
                window.location.href = '/auth/login'
            } else {
                alert('댓글 수정 실패')
            }
        } catch (err) {
            console.error('댓글 수정 에러:', err)
        }
    }

    // 댓글 삭제
    const handleCommentDelete = async (reviewId: number, commentId: number) => {
        if (!confirm('정말 댓글을 삭제하시겠습니까?')) return

        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json()
            if (res.ok) {
                alert('댓글이 삭제되었습니다.')
                fetchComment(reviewId)
            } else {
                alert(data.msg || '댓글 삭제 실패')
            }
        } catch (err) {
            console.error('댓글 삭제 에러:', err)
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
                setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId)) // ✅ 즉시 반영
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

    // ========================= 리뷰 끝 =======================================

    return (
        <>
            <div>
                <div
                    style={{
                        maxWidth: '1280px',
                        margin: '0 auto',
                        padding: '0 20px',
                    }}
                >
                    {/* 🎨 상단 배너 */}
                    <div className="review-banner">
                        <h2>생생한 리뷰를 기다리고 있어요!</h2>
                        <p>사진과 함께 리뷰를 남겨주시면 다른 분들께 큰 도움이 됩니다</p>
                    </div>

                    {/* 제목 + 버튼 */}
                    <div className="review-list-title">
                        <h2>리뷰 목록</h2>
                        {roleType === 'USER' && (
                            <button className="review-write-btn" onClick={handleCreateClick}>
                                리뷰 작성하기
                            </button>
                        )}
                    </div>

                    <hr />
                    <section className="photoReview-container">
                        <h3 className="photoReview-title">📸 포토 리뷰</h3>

                        <Swiper
                            modules={[Navigation]}
                            slidesPerView={5}
                            slidesPerGroup={5}
                            spaceBetween={20}
                            loop={false}
                            onSwiper={setSwiperRef}
                            className="photoReview-swiper"
                            breakpoints={{
                                1200: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 20 },
                                992: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 16 },
                                768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 12 },
                                0: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 10 },
                            }}
                        >
                            {photoReviews.map((r) => (
                                <SwiperSlide key={r.id}>
                                    <div className="photoCard" onClick={() => router.push(`/review/${r.id}`)}>
                                        <img src={r.img} alt={r.title} />
                                        <p>{r.title}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* 커스텀 네비게이션 */}
                        <div ref={prevRef} className="custom-prev">
                            <ChevronLeft size={26} strokeWidth={2.5} />
                        </div>
                        <div ref={nextRef} className="custom-next">
                            <ChevronRight size={26} strokeWidth={2.5} />
                        </div>
                    </section>

                    {/* 📜 리뷰 목록 */}
                    <div ref={reviewTopRef} aria-hidden>
                        <hr style={{ marginBottom: '20px' }} />
                        <h3 className="review-title">리뷰</h3>
                    </div>

                    {/* 평균 별점 */}
                    <div className="review-average-container">
                        {/* 왼쪽 평균 */}
                        <div className="review-average-score">
                            <h2 className="review-average-value">{avgRating}</h2>
                            <div className="review-average-stars">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <FaStar
                                        key={num}
                                        size={22}
                                        color={num <= Math.round(avgRating) ? '#FFD700' : '#E0E0E0'}
                                        style={{ marginRight: '3px' }}
                                    />
                                ))}
                                <small className="review-average-count">({totalCount})</small>
                            </div>
                        </div>

                        {/* 오른쪽 그래프 */}
                        <div className="review-average-graph">
                            {['5', '4', '3', '2', '1'].map((label, i) => {
                                <FaStar
                                        size={22}
                                        color= {'#FFD700'}
                                        style={{ marginRight: '3px' }}
                                    />
                                const score = 5 - i
                                const percent = ratingData[score] || 0
                                return (  
                                    <div className="review-graph-row" key={label}>
                                        <span className="review-graph-label">{label}</span>
                                        <div className="review-graph-bar-bg">
                                            <div className="review-graph-bar-fill" style={{ width: `${percent}%` }} />
                                        </div>
                                        <span className="review-graph-percent">{percent}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* ⭐ 정렬 + 검색 바 */}
                    <div className="review-sort-search">
                        {/* 정렬 */}
                        <div className="review-sort-buttons">
                            {['최신순', '추천순', '별점순'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleSortChange(type as any)}
                                    className={`review-sort-btn ${
                                        (type === '최신순' && sortType === 'date_desc') ||
                                        (type === '추천순' && sortType === 'like_desc') ||
                                        (type === '별점순' && sortType === 'rating_desc')
                                            ? 'active'
                                            : ''
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* 검색 */}
                        <div className="search" style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                className="review-search-input"
                                placeholder="검색"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleSearch()
                                    }
                                }}
                            />
                            <button className="review-search-btn" onClick={handleSearch}>
                                검색
                            </button>
                        </div>
                    </div>

                    <div className="review-list">
                        {reviews.length === 0 ? (
                            <p className="review-empty">현재 작성된 리뷰가 없습니다.</p>
                        ) : (
                            <ul>
                                {reviews.map((review) => (
                                    <li key={review.reviewId} className="review-item">
                                        <div className="review-header">
                                            <span className="review-meta">
                                                {review.createdDate} / 작성자 : {review.createdBy}
                                            </span>
                                        </div>

                                        {/* 별점 */}
                                        <div className="review-rating-row">
                                            <div className="review-stars">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <FaStar
                                                        key={num}
                                                        size={22}
                                                        color={num <= review.rating ? '#FFD700' : '#E0E0E0'}
                                                        style={{ marginRight: '3px' }}
                                                    />
                                                ))}
                                            </div>

                                            {/* 좋아요 / 삭제 버튼 */}
                                            <div className="review-actions">
                                                <button
                                                    className={`review-like-btn ${
                                                        liked[Number(review.reviewId)] ? 'liked' : ''
                                                    }`}
                                                    onClick={() => handleLikeClick(review.reviewId)}
                                                >
                                                    {liked[review.reviewId] ? (
                                                        <FaThumbsUp style={{ marginRight: '6px' }} />
                                                    ) : (
                                                        <FaRegThumbsUp style={{ marginRight: '6px' }} />
                                                    )}
                                                    도움돼요 {likeCounts[review.reviewId] ?? review.reviewLike}
                                                </button>

                                                {(Number(currentUserId) === Number(review.userId) ||
                                                    roleType === 'ADMIN') && (
                                                    <button
                                                        className="review-delete-btn"
                                                        onClick={() => handleDeleteClick(review.reviewId)}
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* 리뷰 내용 */}
                                        <h4 className="review-content-title">📃 리뷰 내용</h4>
                                        <div
                                            className="review-content-box"
                                            onClick={() => (window.location.href = `/review/${review.reviewId}`)}
                                        >
                                            <p className="review-content-text">{review.content}</p>
                                            {review.imageUrls && review.imageUrls.length > 0 && (
                                                <img
                                                    src={`http://localhost:8090${review.imageUrls[0]}`}
                                                    alt="리뷰 이미지"
                                                    className="review-image"
                                                />
                                            )}
                                        </div>

                                        {/* 댓글 */}
                                        {comments[review.reviewId]?.reviewComment && (
                                            <div className="review-comment">
                                                {comments[review.reviewId].reviewComment}
                                            </div>
                                        )}

                                        {/* SELLER만 댓글 조작 
                                            현재 ADMIN도 가능. 추후 삭제만 가능하도록 변경 */}
                                        {roleType === 'SELLER' && (
                                            <>
                                                {comments[review.reviewId]?.reviewComment ? (
                                                    <>
                                                        <button
                                                            className="review-comment-edit-btn"
                                                            onClick={() =>
                                                                setActiveCommentBox(
                                                                    activeCommentBox === `edit-${review.reviewId}`
                                                                        ? null
                                                                        : `edit-${review.reviewId}`,
                                                                )
                                                            }
                                                        >
                                                            댓글 수정
                                                        </button>

                                                        <button
                                                            className="review-comment-delete-btn"
                                                            onClick={() =>
                                                                handleCommentDelete(
                                                                    review.reviewId,
                                                                    comments[review.reviewId]?.commentId,
                                                                )
                                                            }
                                                        >
                                                            댓글 삭제
                                                        </button>

                                                        {isLoggedIn &&
                                                            activeCommentBox === `edit-${review.reviewId}` && (
                                                                <div className="review-comment-editbox">
                                                                    <textarea
                                                                        placeholder="수정할 댓글 내용을 입력하세요."
                                                                        value={reviewComment}
                                                                        onChange={(e) =>
                                                                            setReviewComment(e.target.value)
                                                                        }
                                                                        className="review-comment-textarea"
                                                                    />
                                                                    <button
                                                                        onClick={() =>
                                                                            handleCommentEdit(
                                                                                review.reviewId,
                                                                                comments[review.reviewId]?.commentId,
                                                                            )
                                                                        }
                                                                        className="review-comment-save-btn"
                                                                    >
                                                                        저장
                                                                    </button>
                                                                </div>
                                                            )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="review-comment-add-btn"
                                                            onClick={() =>
                                                                setActiveCommentBox(
                                                                    activeCommentBox === review.reviewId
                                                                        ? null
                                                                        : review.reviewId,
                                                                )
                                                            }
                                                        >
                                                            💬 댓글 달기
                                                        </button>

                                                        {isLoggedIn && activeCommentBox === review.reviewId && (
                                                            <div className="review-comment-addbox">
                                                                <textarea
                                                                    placeholder="댓글을 입력하세요."
                                                                    maxLength={200}
                                                                    value={reviewComment}
                                                                    onChange={(e) => setReviewComment(e.target.value)}
                                                                    className="review-comment-textarea"
                                                                />
                                                                <button
                                                                    onClick={() => handleCommentSubmit(review.reviewId)}
                                                                    className="review-comment-save-btn"
                                                                >
                                                                    댓글 등록
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                        <hr className="review-divider" />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 페이지네이션 */}
                    <div className="review-pagination">
                        <button
                            className="pagination-btn prev"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            ◀ 이전
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                className={`pagination-btn page-number ${currentPage === index ? 'active' : ''}`}
                                onClick={() => handlePageChange(index)}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            className="pagination-btn next"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage + 1 >= totalPages}
                        >
                            다음 ▶
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
