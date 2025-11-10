'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import api from '@/app/utils/api'
import { FaRegThumbsUp, FaStar } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/css/navigation'
import './styles.css'

export default function Review() {
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

    // // ✅ 1회만 로그인 상태 확인
    // useEffect(() => {
    //     checkLoginStatus()
    // }, []) // 의존성 배열 비워둠

    // // ✅ 리뷰 목록 + 정렬 반영
    // useEffect(() => {
    //     fetchReviews(currentPage)
    // }, [currentPage, sortType])

    // useEffect(() => {
    //     if (currentUserId !== null) {
    //         fetchReviews()
    //     }
    // }, [currentUserId])

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

    // ✅ 로그인 + 리뷰 로드 통합
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

    return (
        <div
            style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '0 20px',
            }}
        >
            {/* 🎨 상단 배너 */}
            <div
                style={{
                    maxWidth: '1280px',
                    height: '200px',
                    border: '2px solid gray',
                    borderRadius: '8px',
                    marginBottom: '50px',
                }}
            >
                배너 들어갈 자리 (현재 200px) - 나중에 900px로 조정(안 할수도)
                <br />
                리뷰 이미지를 추가하고 리뷰 작성 유도 문구 삽입
            </div>

            {/* 제목 + 버튼 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h2>리뷰 목록</h2>
                {roleType === 'USER' && (
                    <button
                        onClick={handleCreateClick}
                        style={{
                            backgroundColor: '#bfbfbf',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            marginBottom: '20px',
                        }}
                    >
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
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '60px',
                    marginBottom: '80px',
                }}
            >
                {/* 왼쪽 평균 */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        width: '180px',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '48px',
                            margin: 0,
                            color: '#333',
                        }}
                    >
                        {avgRating}
                    </h2>
                    <div
                        style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {[1, 2, 3, 4, 5].map((num) => (
                            <FaStar
                                key={num}
                                size={22}
                                color={num <= Math.round(avgRating) ? '#FFD700' : '#E0E0E0'}
                                style={{ marginRight: '3px' }}
                            />
                        ))}
                        <small style={{ color: '#777' }}>({totalCount})</small>
                    </div>
                </div>

                {/* 오른쪽 그래프 */}
                <div
                    style={{
                        flex: 1,
                        backgroundColor: '#e5e5e5',
                        padding: '20px 120px',
                        borderRadius: '6px',
                    }}
                >
                    {['최고', '좋음', '보통', '별로', '나쁨'].map((label, i) => {
                        const score = 5 - i
                        const percent = ratingData[score] || 0
                        return (
                            <div
                                key={label}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                }}
                            >
                                <span style={{ width: '40px', fontSize: '14px', color: '#333' }}>{label}</span>
                                <div
                                    style={{
                                        flex: 1,
                                        height: '8px',
                                        backgroundColor: '#f0caca',
                                        borderRadius: '4px',
                                        margin: '0 10px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            backgroundColor: '#ff9c9c',
                                            borderRadius: '4px',
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>
                                <span style={{ width: '30px', fontSize: '12px', color: '#555' }}>{percent}%</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ⭐ 정렬 + 검색 바 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #000',
                    borderBottom: '1px solid #000',
                    padding: '10px 0',
                    marginBottom: '20px',
                }}
            >
                {/* 정렬 */}
                <div style={{ display: 'flex', gap: '20px', fontSize: '16px' }}>
                    {['최신순', '추천순', '별점순'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleSortChange(type)}
                            style={{
                                background:
                                    (type === '최신순' && sortType === 'date_desc') ||
                                    (type === '추천순' && sortType === 'like_desc') ||
                                    (type === '별점순' && sortType === 'rating_desc')
                                        ? '#AD9263'
                                        : 'transparent',
                                color:
                                    (type === '최신순' && sortType === 'date_desc') ||
                                    (type === '추천순' && sortType === 'like_desc') ||
                                    (type === '별점순' && sortType === 'rating_desc')
                                        ? 'white'
                                        : 'black',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight:
                                    (type === '최신순' && sortType === 'date_desc') ||
                                    (type === '추천순' && sortType === 'like_desc') ||
                                    (type === '별점순' && sortType === 'rating_desc')
                                        ? 'bold'
                                        : 'normal',
                                transition: '0.2s',
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* 검색 */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="키워드 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '14px',
                            width: '180px',
                            marginRight: '6px',
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            backgroundColor: '#AD9263',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                        }}
                    >
                        검색
                    </button>
                </div>
            </div>

            <div
                className="review-list"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* <h4>번호 / 작성일 / 별점 / 작성자 / 좋아요 / 삭제</h4> */}

                {reviews.length === 0 ? (
                    <p>현재 작성된 리뷰가 없습니다.</p>
                ) : (
                    <ul>
                        {reviews.map((review) => (
                            <li key={review.reviewId} style={{ marginBottom: '40px', width: '800px' }}>
                                {/* 🧾 작성일 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#777', fontSize: '14px' }}>
                                        {review.createdDate} / 작성자 : {review.createdBy}
                                    </span>
                                </div>

                                {/* ⭐ 별점 */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: '8px',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
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
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: '10px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        {/* 👍 좋아요 버튼 영역 */}
                                        {(roleType === 'USER' || roleType === 'SELLER') && (
                                            <div>
                                                <button
                                                    onClick={() => handleLikeClick(review.reviewId)}
                                                    style={{
                                                        backgroundColor: '#FF8080',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 16px',
                                                        cursor: 'pointer',
                                                        transition: '0.2s',
                                                        fontSize: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor = '#d66464')
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor = '#FF8080')
                                                    }
                                                >
                                                    <FaRegThumbsUp />
                                                    도움돼요 {likeCounts[review.reviewId] ?? review.reviewLike}
                                                </button>
                                            </div>
                                        )}

                                        {/* 🗑️ 삭제 버튼 영역 */}
                                        {Number(currentUserId) === Number(review.userId) && (
                                            <div>
                                                <button
                                                    onClick={() => handleDeleteClick(review.reviewId)}
                                                    style={{
                                                        backgroundColor: '#555555',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 16px',
                                                        cursor: 'pointer',
                                                        transition: '0.2s',
                                                        fontSize: '14px',
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor = '#333333')
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor = '#555555')
                                                    }
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* 📃 리뷰 내용 */}
                                <h4 style={{ margin: '5px' }}>📃 리뷰 내용</h4>
                                <div
                                    onClick={() => (window.location.href = `/review/${review.reviewId}`)}
                                    style={{
                                        display: '-webkit-box',
                                        width: '800px',
                                        height: '80px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        overflow: 'hidden',
                                        WebkitLineClamp: '4',
                                        WebkitBoxOrient: 'vertical',
                                        cursor: 'pointer',
                                        backgroundColor: '#fafafa',
                                        transition: '.3s',
                                        // whiteSpace: 'pre-wrap',
                                        // wordBreak: 'keep-all',
                                        lineHeight: '1.6',
                                        marginBottom: '10px',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                >
                                    {review.imageUrls && review.imageUrls.length > 0 && (
                                        <img
                                            src={review.imageUrls[0]} // 첫 번째 이미지
                                            alt="리뷰 이미지"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                marginRight: '15px',
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}

                                    {/* 리뷰 내용 텍스트 */}
                                    <p
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: '4',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.6',
                                            margin: 0,
                                            flex: 1,
                                        }}
                                    >
                                        {review.content}
                                    </p>
                                </div>
                                {/* 💬 댓글 표시 (누구에게나 보여짐) */}
                                {comments[review.reviewId]?.reviewComment ? (
                                    <div
                                        style={{
                                            marginTop: '8px',
                                            width: '800px',
                                            minHeight: '30px',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px',
                                            padding: '8px',
                                            backgroundColor: '#fafafa',
                                            whiteSpace: 'pre-wrap',
                                        }}
                                    >
                                        {comments[review.reviewId].reviewComment}
                                    </div>
                                ) : null}
                                {/* 💼 SELLER만 댓글 조작 가능 */}
                                {roleType === 'SELLER' ? (
                                    <>
                                        {/* 이미 댓글 있음 → 수정/삭제 */}
                                        {comments[review.reviewId]?.reviewComment ? (
                                            <>
                                                <button
                                                    style={{
                                                        backgroundColor: '#AD9263',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '4px 10px',
                                                        marginTop: '5px',
                                                        cursor: 'pointer',
                                                    }}
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
                                                    style={{
                                                        backgroundColor: '#b33a3a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '4px 10px',
                                                        marginTop: '5px',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() =>
                                                        handleCommentDelete(
                                                            review.reviewId,
                                                            comments[review.reviewId]?.commentId,
                                                        )
                                                    }
                                                >
                                                    🗑 댓글 삭제
                                                </button>

                                                {/* 수정창 */}
                                                {isLoggedIn && activeCommentBox === `edit-${review.reviewId}` && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <textarea
                                                            placeholder="수정할 댓글 내용을 입력하세요."
                                                            style={{
                                                                width: '300px',
                                                                height: '60px',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '8px',
                                                                padding: '5px',
                                                            }}
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                        />
                                                        <br />
                                                        <button
                                                            onClick={() =>
                                                                handleCommentEdit(
                                                                    review.reviewId,
                                                                    comments[review.reviewId]?.commentId,
                                                                )
                                                            }
                                                            style={{
                                                                backgroundColor: '#AD9263',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '8px 16px',
                                                                marginTop: '5px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            저장
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {/* 댓글 없음 → 등록 가능 */}
                                                <button
                                                    style={{
                                                        backgroundColor: '#bfbfbf',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '4px 10px',
                                                        marginTop: '5px',
                                                        cursor: 'pointer',
                                                    }}
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
                                                    <div style={{ marginTop: '10px' }}>
                                                        <textarea
                                                            placeholder="댓글을 입력하세요."
                                                            maxLength={200}
                                                            style={{
                                                                width: '300px',
                                                                height: '60px',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '8px',
                                                                padding: '5px',
                                                            }}
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                        />
                                                        <br />
                                                        <button
                                                            onClick={() => handleCommentSubmit(review.reviewId)}
                                                            style={{
                                                                backgroundColor: '#AD9263',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 14px',
                                                                marginTop: '5px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            댓글 등록
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button
                style={{
                    backgroundColor: '#AD9263',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px', // ✅ 버튼 패딩 기준
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                테스트
            </button>
            {/* 페이지네이션 */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    style={{
                        marginRight: '10px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    }}
                >
                    ◀ 이전
                </button>

                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            fetchReviews(index)
                            scrollToTop()
                        }}
                        style={{
                            margin: '0 4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            backgroundColor: currentPage === index ? '#AD9263' : 'white',
                            color: currentPage === index ? 'white' : 'black',
                            fontWeight: currentPage === index ? 'bold' : 'normal',
                            cursor: 'pointer',
                        }}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage + 1 >= totalPages}
                    style={{
                        marginLeft: '10px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer',
                    }}
                >
                    다음 ▶
                </button>
            </div>
        </div>
    )
}
