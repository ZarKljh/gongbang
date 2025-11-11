'use client'
import { useEffect, useState, useRef } from 'react'
import { FaRegThumbsUp, FaStar } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/css/navigation'
import './review.css'
import styles from './Detail.module.css'

export default function detail() {
    // ======================== 상품 =========================

    // ======================= 상품 끝 =======================



    // ================= 리뷰 =================
    const [reviews, setReviews] = useState([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [activeCommentBox, setActiveCommentBox] = useState(null)
    const [reviewComment, setReviewComment] = useState('') // ✅ null → ''
    const [comments, setComments] = useState({})
    const [likeCounts, setLikeCounts] = useState({})
    const [avgRating, setAvgRating] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalpages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const reviewTopRef = useRef<HTMLDivElement>(null)
    const [roleType, setRoleType] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const prevRef = useRef<HTMLDivElement | null>(null)
    const nextRef = useRef<HTMLDivElement | null>(null)
    const [sortType, setSortType] = useState('date_desc')
    const [keyword, setKeyword] = useState('')

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
            }
        } catch (err) {
            console.error('로그인 상태 확인 실패', err)
            setIsLoggedIn(false)
            setRoleType(null)
            setCurrentUserId(null)
        }
    }

    // 로그인 + 리뷰 로드 통합
    useEffect(() => {
        const init = async () => {
            await checkLoginStatus() // 1️⃣ 로그인 먼저 확인
            await fetchReviews(currentPage) // 2️⃣ 로그인 완료 후 리뷰 로드
        }

        init()
    }, [currentPage, sortType]) // ✅ 페이지·정렬 바뀔 때만 다시 실행

    // 페이지 버튼 클릭 시에 호출(상단 이동)

    const scrollToTop = () => {
        reviewTopRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handlePageChange = (pageNumber) => {
        // 페이지 변경
        fetchReviews(pageNumber)

        // 스크롤 이동 — DOM 업데이트 후 실행되도록 약간의 delay 추가
        setTimeout(() => {
            scrollToTop()
        }, 100)
    }

    // 리뷰 목록 조회
    const fetchReviews = async (page = 0, sort = sortType) => {
        try {
            const res = await fetch(
                `http://localhost:8090/api/v1/reviews?page=${page}&sort=${sortType}&keyword=${encodeURIComponent(
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
            setCurrentPage(data.data.currentPage)
            setTotalpages(data.data.totalPages)
            console.log('정렬 요청, sortType:', sortType, 'page:', page)

            // if (reviewTopRef.current) {
            //     reviewTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            // }

            // 리뷰별 좋아요 카운트 초기화
            const initialCounts = {}
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

    // ✅ 임시 평점 통계 데이터 (추후 연동)
    const ratingData = { 5: 68, 4: 20, 3: 7, 2: 3, 1: 2 }
    // const avgRating = 4.5
    // const totalCount = 226

    // 평균 별점 (물품 상세 만들어지면 사용)
    // useEffect(() => {
    //     const fetchAverage = async () => {
    //         try {
    //             // 상품상세 연결 후 reviewId -> productId로 변경
    //             const res = await fetch(`http://localhost:8090/api/v1/reviews/average/${productId}`)
    //             const data = await res.json()
    //             setAvgRating(data?.data?.avgRating || 0)
    //             setTotalCount(data?.data?.totalCount || 0)
    //         } catch (err) {
    //             console.error('평균 별점 불러오기 실패:', err)
    //         }
    //     }
    //     fetchAverage()
    // }, [])

    // 상세 만들어지기 전 임시 사용
    useEffect(() => {
        const fetchAverage = async () => {
            try {
                const res = await fetch('http://localhost:8090/api/v1/reviews/stats/average')
                const data = await res.json()
                console.log('⭐ 평균별점 응답:', data)
                setAvgRating(data?.data?.avgRating ?? 0)
                setTotalCount(data?.data?.totalCount ?? 0)
            } catch (err) {
                console.error('평균 별점 불러오기 실패:', err)
            }
        }
        fetchAverage()
    }, [])

    // 포토리뷰
    const photoReviews = Array.from({ length: 25 }).map((_, i) => ({
        id: i + 1,
        title: `포토리뷰${i + 1}`,
        img: `/images/review${i + 1}.jpg`,
    }))

    // ✅ 정렬 요청
    const handleSortChange = (type) => {
        let newSort = 'date_desc' // 기본값

        if (type === '추천순') newSort = 'like_desc'
        else if (type === '최신순') newSort = 'date_desc'
        else if (type === '별점순') newSort = 'rating_desc'

        setSortType(newSort)
        fetchReviews(0, newSort)
    }

    // 검색 기능 나중에
    const handleSearch = async () => {
        fetchReviews(0)
    }

    // 댓글 조회
    const fetchComment = async (reviewId) => {
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
            window.location.href = '/review/create'
        }
    }

    // 리뷰 좋아요 버튼
    const handleLikeClick = async (reviewId) => {
        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}/like`, {
                method: 'POST',
                credentials: 'include',
            })
            // const data = await res.json()

            //     if (res.ok) {
            //         // 리뷰별 카운트만 업데이트
            //         setLikeCounts((prev) => ({
            //             ...prev,
            //             [reviewId]: (prev[reviewId] ?? 0) + (data.msg.includes('등록') ? 1 : -1),
            //         }))
            //     } else {
            //         alert(data.msg)
            //     }
            // } catch (err) {
            //     console.error('좋아요 요청 실패:', err)
            // }

            if (!isLoggedIn) {
                if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
                    window.location.href = '/auth/login'
                }
            }

            // ✅ 요청 실패 시 (서버 오류 등)
            if (!res.ok) {
                console.error('좋아요 요청 실패:', res.status)
                return
            }

            const data = await res.json()

            // ✅ 서버에서 메시지 보고 판단
            if (data.msg.includes('등록')) {
                // 좋아요 추가
                setLikeCounts((prev) => ({
                    ...prev,
                    [reviewId]: (prev[reviewId] ?? 0) + 1,
                }))
            } else if (data.msg.includes('취소')) {
                // 좋아요 취소
                setLikeCounts((prev) => ({
                    ...prev,
                    [reviewId]: Math.max(0, (prev[reviewId] ?? 1) - 1), // 음수 방지
                }))
            }
        } catch (err) {
            console.error('좋아요 요청 실패:', err)
        }
    }

    // 댓글 등록 버튼
    const handleCommentSubmit = async (reviewId) => {
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
    const handleCommentEdit = async (reviewId, commentId) => {
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
    const handleCommentDelete = async (reviewId: number, commentId) => {
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

    // 로그인 했을 때 userId와 맞는 리뷰에만 나타나게 수정해야함.
    const handleDeleteClick = async (reviewId: number) => {
        try {
            if (!isLoggedIn) {
                if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
                    window.location.href = '/auth/login'
                }
                return
            }

            const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json()
            console.log('🗑️ 삭제 응답:', data)

            if (res.ok && data.resultCode === '200') {
                alert('리뷰가 삭제되었습니다.')
                setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId)) // ✅ 즉시 반영
                // fetchReviews()
                return
            } else if (data.resultCode === '403') {
                alert('본인만 리뷰를 삭제할 수 있습니다.')
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
            <div className={styles.pageWrapper}>
                <div className={styles.productDetail}>
                    <div className={styles.productImage}>상품이미지</div>

                    <div className={styles.productInfo}>
                        <div className={styles.sellerHeader}>
                            <span>상품의 셀러 프로필</span>
                            <span>팔로우</span>
                        </div>

                        <div className={styles.productOptions}>
                            <p>상품옵션 선택</p>
                            <input type="text" placeholder="옵션 1" />
                            <input type="text" placeholder="옵션 2" />
                            <input type="text" placeholder="옵션 3" />
                        </div>

                        <div className={styles.actionButtons}>
                            <button>장바구니</button>
                            <button>구매/결제</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =============================== 리뷰 영역 ===================================== */}
            <div
                style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 20px',
                }}
            >
                {/* 🎨 상단 배너 */}
                <div className="review-banner">
                    배너 들어갈 자리 (현재 200px) - 나중에 900px로 조정(안 할수도)
                    <br />
                    리뷰 이미지를 추가하고 리뷰 작성 유도 문구 삽입
                </div>

                {/* 제목 + 버튼 */}
                <div className="review-title">
                    <h2>리뷰 목록</h2>
                    {roleType === 'USER' && (
                        <button className="reivew-write-btn" onClick={handleCreateClick}>
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
                        centeredSlides={false}
                        // 버튼을 초기화 전에 수동 주입
                        onBeforeInit={(swiper) => {
                            swiper.params.navigation = {
                                ...(swiper.params.navigation as object),
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }
                        }}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        className="photoReview-swiper"
                        // 화면 폭에 따른 보장 (옵션)
                        breakpoints={{
                            1200: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 20 },
                            992: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 16 },
                            768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 12 },
                            0: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 10 },
                        }}
                    >
                        {photoReviews.map((r) => (
                            <SwiperSlide key={r.id}>
                                <div className="photoCard">
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
                <hr />

                {/* 📜 리뷰 목록 */}
                <div ref={reviewTopRef} aria-hidden>
                    <h3>리뷰</h3>
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
                        {['최고', '좋음', '보통', '별로', '나쁨'].map((label, i) => {
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
                                onClick={() => handleSortChange(type)}
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
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            className="review-search-input"
                            placeholder="키워드 검색"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
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

                                    {/* ⭐ 별점 */}
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
                                            <strong style={{ marginLeft: '6px', fontSize: '15px' }}></strong>
                                        </div>

                                        {/* ✏️ 좋아요 / 삭제 버튼 */}
                                        <div className="review-actions">
                                            {(roleType === 'USER' || roleType === 'SELLER') && (
                                                <button
                                                    className="review-like-btn"
                                                    onClick={() => handleLikeClick(review.reviewId)}
                                                >
                                                    <FaRegThumbsUp />
                                                    도움돼요 {likeCounts[review.reviewId] ?? review.reviewLike}
                                                </button>
                                            )}
                                            {Number(currentUserId) === Number(review.userId) && (
                                                <button
                                                    className="review-delete-btn"
                                                    onClick={() => handleDeleteClick(review.reviewId)}
                                                >
                                                    삭제
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 📃 리뷰 내용 */}
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

                                    <hr className="review-divider" />

                                    {/* 💬 댓글 */}
                                    {comments[review.reviewId]?.reviewComment && (
                                        <div className="review-comment">{comments[review.reviewId].reviewComment}</div>
                                    )}

                                    {/* 💼 SELLER만 댓글 조작 */}
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
                                                        ✏️ 댓글 수정
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
                                                        🗑 댓글 삭제
                                                    </button>

                                                    {isLoggedIn && activeCommentBox === `edit-${review.reviewId}` && (
                                                        <div className="review-comment-editbox">
                                                            <textarea
                                                                placeholder="수정할 댓글 내용을 입력하세요."
                                                                value={reviewComment}
                                                                onChange={(e) => setReviewComment(e.target.value)}
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
                            onClick={() => {
                                fetchReviews(index)
                                scrollToTop()
                            }}
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
            {/* =============================== 리뷰 영역 끝 ===================================== */}
        </>
    )
}
