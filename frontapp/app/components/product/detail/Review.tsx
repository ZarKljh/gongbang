'use client'

import '@/app/components/product/detail/styles/review.css'
import { useEffect, useState, useRef } from 'react'
import { FaThumbsUp, FaRegThumbsUp, FaStar } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import 'swiper/css/navigation'
import ReportButton from '@/app/admin/components/ReportButton'
import { Nanum_Brush_Script } from 'next/font/google'
import api from '@/app/utils/api'

export default function Review() {
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

    // 페이징 관련
    const [totalPages, setTotalpages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const maxPageButtons = 10 // 최대 표시할 페이지 개수
    const halfRange = Math.floor(maxPageButtons / 2)

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
    const [showModal, setShowModal] = useState()
    // 모달에서 사용할 이미지 목록 (리뷰 전체)
    const [modalImages, setModalImages] = useState([])

    // 상품Id 기준 리뷰 가져오기
    const searchParams = useSearchParams()
    const [productId, setProductId] = useState<number | null>(null)

    // 수정 버튼 클릭시 상태 변화 감지
    const editTextareaRef = useRef<HTMLTextAreaElement | null>(null)

    // 별점 필터
    const [ratingFilter, setRatingFilter] = useState<number | null>(null)
    // 별점 옵션
    const RATING_OPTIONS = [
        { value: null, label: '전체' },
        { value: 5, label: '★ 5점' },
        { value: 4, label: '★ 4점' },
        { value: 3, label: '★ 3점' },
        { value: 2, label: '★ 2점' },
        { value: 1, label: '★ 1점' },
    ]

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
            const res = await api.get('auth/me')

            console.log('로그인 상태 : ', res.status, res.ok)

            const data = res.data

            setIsLoggedIn(true)
            setCurrentUserId(data.data.id)
            setRoleType(data.data.role || null)
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
    const fetchReviews = async (productId: number, page = 0, sort: string, ratingFilter: number | null) => {
        try {
            const res = await api.get(`/reviews`, {
                params: {
                    productId,
                    page,
                    sort,
                    rating: ratingFilter ?? '',
                },
            })

            const data = res.data
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

    // 페이징 계산
    let startPage = Math.max(0, currentPage - halfRange)
    let endPage = startPage + maxPageButtons

    // ▼ endPage가 totalPages보다 크면 조정
    if (endPage > totalPages) {
        endPage = totalPages
        startPage = Math.max(0, endPage - maxPageButtons)
    }

    // productId / currentPage / sortType / ratingFilter 바뀔 때마다 리뷰 재조회
    useEffect(() => {
        if (!productId) return
        fetchReviews(productId, currentPage, sortType, ratingFilter)
        fetchLikedReviews(productId)
    }, [productId, currentPage, sortType, ratingFilter])

    const scrollToTop = () => {
        const top = reviewTopRef.current?.offsetTop
        window.scrollTo({
            top: top - 60,
            behavior: 'smooth',
        })
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
            const res = await api.get(`/reviews/photo`, {
                params: { productId },
            })

            const data = res.data

            if (data.data) {
                const formatted = data.data.map((r) => ({
                    id: r.reviewId,
                    img: `http://localhost:8090${r.imageUrl}`,
                    title: r.content.length > 15 ? r.content.slice(0, 15) + '...' : r.content,
                }))
                setPhotoReviews(formatted)
            }
        } catch (e) {
            console.error('전체 포토 리뷰 조회 실패', e)
        }
    }

    useEffect(() => {
        if (productId) fetchPhotoReviews()
    }, [productId])

    // 모달 열기 + 전체 이미지 세팅
    const openPhotoModal = () => {
        setModalImages(photoReviews) // 전체 포토 이미지 모달에 표시
        setShowModal(true)
    }

    // 모달 닫기
    const closePhotoModal = () => {
        setShowModal(false)
    }

    // 모달 리뷰 이미지 클릭시 상세 리뷰 이동
    const moveToDetail = (reviewId) => {
        router.push(`/review/${reviewId}`)
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
                const res = await api.get(`/reviews/average/${productId}`)
                const data = res.data

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
                const res = await api.get(`/reviews/rating-group/${productId}`)
                const data = res.data

                const counts = data.data

                setRatingData(counts)
            } catch (err) {
                console.error('별점 분포 불러오기 실패:', err)
            }
        }

        fetchRatingGroup()
        const totalCount = Object.values(ratingData).reduce((a: number, b: number) => a + b, 0)
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
    // const handleSearch = async () => {
    //     if (!productId) return

    //     console.log('검색 버튼 클릭, keyword =', keyword)
    //     // keyword는 state로 관리되고 있으니, 여기서는 현재 sortType 그대로 0페이지부터 조회

    //     setCurrentPage(0)

    //     fetchReviews(productId, 0, sortType)
    // }

    // 댓글 조회
    const fetchComment = async (reviewId: number) => {
        try {
            const res = await api.get(`/reviews/${reviewId}/comments`)
            const data = res.data
            setComments((prev) => ({
                ...prev,
                [reviewId]: data.data || null,
            }))
            console.log('comments:', comments[review.reviewId])
        } catch (err) {
            // console.error(`댓글(${reviewId}) 조회 실패:`, err)
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
            const res = await api.post(`/reviews/${reviewId}/like`)
            const data = res.data

            if (!isLoggedIn) {
                if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
                    window.location.href = '/auth/login'
                }
            }

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

    // 좋아요 상태 받아오기
    const fetchLikedReviews = async (productId: number) => {
        const res = await api.get(`/reviews/likes/me`, {
            params: { productId },
        })

        const data = res.data

        const list: number[] = Array.isArray(data.data) ? data.data : []

        const likedState: Record<number, boolean> = {}
        data.data.forEach((reviewId: number) => {
            likedState[reviewId] = true
        })
        setLiked(likedState)
    }

    // 댓글 등록 버튼
    const handleCommentSubmit = async (reviewId: number) => {
        if (!reviewComment.trim()) {
            alert('댓글 내용을 입력해주세요.')
            return
        }

        try {
            const res = await api.post(`/reviews/${reviewId}/comments`, {
                review_id: reviewId,
                review_comment: reviewComment,
            })

            alert('댓글이 등록되었습니다.')
            setReviewComment('')
            setActiveCommentBox(null)
            fetchComment(reviewId) // 등록 후 갱신
        } catch (err: any) {
            if (err.response?.status === 401) {
                alert('로그인이 필요합니다.')
                window.location.href = '/auth/login'
            } else {
                alert('댓글 등록 실패')
            }
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
            await api.patch(`/reviews/${reviewId}/comments/${commentId}`, {
                review_comment: reviewComment,
            })

            alert('댓글이 수정되었습니다.')
            setReviewComment('')
            setActiveCommentBox(null)
            fetchComment(reviewId) // 수정 후 갱신
        } catch (err: any) {
            if (err.response?.status === 401) {
                alert('로그인이 필요합니다.')
                window.location.href = '/auth/login'
            } else {
                alert('댓글 수정 실패')
            }
            console.error('댓글 수정 에러:', err)
        }
    }

    // 댓글 삭제
    const handleCommentDelete = async (reviewId: number, commentId: number) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return

        try {
            const res = await api.delete(`/reviews/${reviewId}/comments/${commentId}`)
            const data = res.data

            alert('댓글이 삭제되었습니다.')
            fetchComment(reviewId)
        } catch (err: any) {
            const msg = err.response?.data?.msg || '댓글 삭제 실패'
            alert(msg)
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

            const res = await api.delete(`/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!confirm('리뷰를 삭제하시겠습니까?')) return

            const data = res.data
            console.log('🗑️ 삭제 응답:', data)

            if (data.resultCode === '200') {
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
                    }}
                >
                    {/* 🎨 상단 배너 */}
                    <div className="review-banner">
                        {/* <h2>생생한 리뷰를 기다리고 있어요!</h2> */}
                        {/* <p>사진과 함께 리뷰를 남겨주시면 다른 분들께 큰 도움이 됩니다</p> */}
                        <img className="review-banner-img" src="/images/리뷰_배너2.png" alt="배너 이미지" />
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

                    <hr style={{ border: '1px solid #E9DCC4' }} />
                    <section className="photoReview-container">
                        <h3 className="photoReview-title">포토 리뷰</h3>

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
                                992: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 16 },
                                768: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 12 },
                                0: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 10 },
                            }}
                        >
                            {photoReviews.map((r) => (
                                <SwiperSlide key={r.id}>
                                    <div className="photoCard" onClick={openPhotoModal}>
                                        <img src={r.img} alt={r.title} />

                                        <p>{r.title}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* 포토 모달 */}
                        {showModal && (
                            <div
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.7)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 2000,
                                }}
                                onClick={closePhotoModal}
                            >
                                {/* 모달 내용 */}
                                <div
                                    style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        width: '70%',
                                        maxHeight: '80vh',
                                        overflowY: 'auto',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 style={{ marginBottom: '15px' }}>포토 리뷰 전체 보기</h3>

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '12px',
                                        }}
                                    >
                                        {modalImages.map((item) => (
                                            <img
                                                key={item.id}
                                                src={item.img}
                                                alt=""
                                                style={{
                                                    width: '160px',
                                                    height: '160px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => moveToDetail(item.id)} // 클릭 → 상세 페이지 이동
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
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
                                const score = 5 - i
                                const count = ratingData[score] || 0

                                // width: 전체 대비 비율
                                const width = totalCount === 0 ? 0 : Math.round((count / totalCount) * 100)

                                return (
                                    <div className="review-graph-row" key={label}>
                                        <span className="review-graph-label">
                                            <FaStar size={20} color={'#FFD700'} style={{ marginRight: '3px' }} />
                                            {label}
                                        </span>
                                        <div className="review-graph-bar-bg">
                                            <div className="review-graph-bar-fill" style={{ width: `${width}%` }} />
                                        </div>

                                        {/* 표시 부분: count 개 */}
                                        <span className="review-graph-percent">{count}</span>
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
                        {/* <div className="search" style={{ display: 'flex', alignItems: 'center' }}>
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
                        </div> */}
                        <div className="review-sort-right">
                            <select
                                className="review-rating-select"
                                value={ratingFilter ?? ''}
                                onChange={(e) => {
                                    const v = e.target.value ? Number(e.target.value) : null
                                    setRatingFilter(v)
                                    setCurrentPage(0) // 필터 바뀌면 0페이지부터
                                }}
                            >
                                <option value="">전체</option>
                                <option value="5">5점</option>
                                <option value="4">4점</option>
                                <option value="3">3점</option>
                                <option value="2">2점</option>
                                <option value="1">1점</option>
                            </select>
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
                                            <div className="review-user-avatar">
                                                <img
                                                    src={
                                                        review.profileImageUrl
                                                            ? `http://localhost:8090${review.profileImageUrl}`
                                                            : '/images/default_profile.jpg'
                                                    }
                                                    alt="프로필"
                                                />
                                            </div>

                                            <div className="review-user-info">
                                                <span className="review-user-name">{review.createdBy}</span>
                                                <span className="review-meta">{review.createdDate}</span>
                                            </div>
                                        </div>
                                        {/* 별점 */}
                                        <div className="review-rating-row">
                                            <div className="review-stars">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <FaStar
                                                        key={num}
                                                        size={28}
                                                        color={num <= review.rating ? '#FFD700' : '#E0E0E0'}
                                                        style={{ marginRight: '3px' }}
                                                    />
                                                ))}
                                            </div>

                                            {/* 좋아요 / 삭제 버튼 */}
                                            <div className="review-actions">
                                                <div className="report-btn">
                                                    <ReportButton targetType="POST" targetId={review.review_id} />
                                                </div>
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
                                        <h4 className="review-content-title"></h4>
                                        <div
                                            className="review-content-box"
                                            onClick={() => router.push(`/review/${review.reviewId}`)}
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
                                        {/* 댓글 내용 표시 */}
                                        {comments[review.reviewId]?.reviewComment ? (
                                            <>
                                                <p className="review-comment-label">사장님 댓글</p>

                                                {/* 수정 모드 */}
                                                {activeCommentBox === `edit-${review.reviewId}` ? (
                                                    <>
                                                        <div className="review-comment-editbox">
                                                            <textarea
                                                                ref={editTextareaRef}
                                                                placeholder="수정할 댓글 내용을 입력하세요."
                                                                value={reviewComment}
                                                                onChange={(e) => setReviewComment(e.target.value)}
                                                                className="review-comment-textarea"
                                                                maxLength={200}
                                                            />
                                                        </div>

                                                        {/* 저장/취소 버튼 (수정 모드) */}
                                                        <div className="review-comment-actions">
                                                            <button
                                                                className="review-comment-save-btn"
                                                                onClick={() =>
                                                                    handleCommentEdit(
                                                                        review.reviewId,
                                                                        comments[review.reviewId]?.commentId,
                                                                    )
                                                                }
                                                            >
                                                                저장
                                                            </button>

                                                            <button
                                                                className="review-comment-cancel-btn"
                                                                onClick={() => {
                                                                    setActiveCommentBox(null)
                                                                    setReviewComment(
                                                                        comments[review.reviewId]?.reviewComment,
                                                                    )
                                                                }}
                                                            >
                                                                취소
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* 평소 댓글 박스 */}
                                                        <div className="review-comment">
                                                            <div className="review-comment-content">
                                                                {comments[review.reviewId]?.reviewComment}
                                                            </div>
                                                        </div>

                                                        {/* 평소 모드 버튼들 */}
                                                        {isLoggedIn &&
                                                            Number(comments[review.reviewId]?.userId) ===
                                                                Number(currentUserId) && (
                                                                <div className="review-comment-actions">
                                                                    <button
                                                                        className="review-comment-edit-btn"
                                                                        onClick={() => {
                                                                            setActiveCommentBox(
                                                                                `edit-${review.reviewId}`,
                                                                            )
                                                                            setReviewComment(
                                                                                comments[review.reviewId]
                                                                                    ?.reviewComment,
                                                                            )
                                                                            // 렌더 후 textarea 커서 포커스
                                                                            setTimeout(() => {
                                                                                editTextareaRef.current?.focus()
                                                                            }, 0)
                                                                        }}
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
                                                                </div>
                                                            )}

                                                        {/* 관리자 삭제만 */}
                                                        {isLoggedIn && roleType === 'ADMIN' && (
                                                            <div className="review-comment-actions">
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
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            /* 댓글 없음 */
                                            <>
                                                {isLoggedIn &&
                                                    roleType === 'SELLER' &&
                                                    activeCommentBox !== review.reviewId && (
                                                        <button
                                                            className="review-comment-add-btn"
                                                            onClick={() => setActiveCommentBox(review.reviewId)}
                                                        >
                                                            댓글 작성하기
                                                        </button>
                                                    )}

                                                {isLoggedIn &&
                                                    roleType === 'SELLER' &&
                                                    activeCommentBox === review.reviewId && (
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

                        {[...Array(endPage - startPage)].map((_, index) => {
                            const pageIndex = startPage + index

                            return (
                                <button
                                    key={pageIndex}
                                    className={`pagination-btn page-number ${
                                        currentPage === pageIndex ? 'active' : ''
                                    }`}
                                    onClick={() => handlePageChange(pageIndex)}
                                >
                                    {pageIndex + 1}
                                </button>
                            )
                        })}

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
