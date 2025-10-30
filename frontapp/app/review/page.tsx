'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import api from '@/app/utils/api'

export default function Review() {
    const [reviews, setReviews] = useState([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [activeCommentBox, setActiveCommentBox] = useState(null)
    const [reviewComment, setReviewComment] = useState('') // ✅ null → ''
    const [comments, setComments] = useState({})
    const [likeCounts, setLikeCounts] = useState({})
    const [totalPages, setTotalpages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const reviewTopRef = useRef<HTMLDivElement>(null)

    ///// ======== font 페이징 관련 ========
    // const [currentPage, setCurrentPage] = useState(1)
    // const itemsPerPage = 10
    // // 배열 10개씩 잘라 보여주기
    // const indexOfLastItem = currentPage * itemsPerPage
    // const indexOfFirstItem = indexOfLastItem - itemsPerPage
    // const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem)

    // const totalPages = Math.ceil(reviews.length / itemsPerPage)

    // const handlePageChange = (pageNumber) => {
    //     if (pageNumber < 1 || pageNumber > totalPages) return
    //     setCurrentPage(pageNumber)
    // }
    ///// 페이징 관련 =======================

    // 페이지 많아졌을 시 현재 5페이지면 “3 4 5 6 7”만 표시 (나중에 사용)
    //     const visiblePages = [...Array(totalPages)].slice(
    //   Math.max(0, currentPage - 2),
    //   Math.min(totalPages, currentPage + 3)
    // );

    useEffect(() => {
        checkLoginStatus()
        fetchReviews()
    }, [])

    // 로그인 여부 확인
    const checkLoginStatus = async () => {
        try {
            const res = await fetch('http://localhost:8090/api/auth/me', {
                method: 'GET',
                credentials: 'include',
            })
            if (res.ok) {
                setIsLoggedIn(true)
            } else {
                setIsLoggedIn(false)
            }
        } catch {
            setIsLoggedIn(false)
        }
    }

    // 페이지 버튼 클릭 시에 호출(상단 이동)

    const scrollToTop = () => {
        reviewTopRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // 리뷰 목록 조회
    const fetchReviews = async (page = 0) => {
        try {
            const res = await fetch(`http://localhost:8090/api/v1/reviews?page=${page}`, {
                method: 'GET',
                credentials: 'omit', // 쿠키 없이 요청 (비로그인도 가능)
            })
            const data = await res.json()
            const fetchedReviews = data.data.reviews || []
            setReviews(fetchedReviews)
            setCurrentPage(data.data.currentPage)
            setTotalpages(data.data.totalPages)

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

    // 로그인 했을 때 userId와 맞는 리뷰에만 나타나게 수정해야함.
    const handleDeleteClick = async (reviewId) => {
        const res = await fetch(`http://localhost:8090/api/v1/reviews/${reviewId}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        if (!isLoggedIn) {
            if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
                window.location.href = '/auth/login'
            }
        }
        if (res.ok) {
            alert('리뷰가 삭제되었습니다.')
            fetchReviews()
        }
        // else {
        //     alert('리뷰 삭제에 실패했습니다.')
        // }
    }

    return (
        <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
            }}
        >
            <div style={{
                maxWidth: "1200px",
                height: "700px",
                border: '2px solid gray',
                borderRadius: '8px',
                marginBottom: '80px',
            }}>배너들어갈 자리
            <img src="https://kr.pinterest.com/pin/952581758702094370/" alt="임시 이미지" /></div>
            <>
                {/* 제목 + 버튼 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <h2>리뷰 목록</h2>
                    <button
                        onClick={handleCreateClick}
                        style={{
                            backgroundColor: '#bfbfbf',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                        }}
                    >
                        리뷰 작성하기
                    </button>
                </div>

                <hr />
                <div className="photoReview">
                    <h3>포토 리뷰</h3>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>
                            <Link href="#">포토리뷰1</Link>
                        </div>
                        <div>
                            <Link href="#">포토리뷰2</Link>
                        </div>
                        <div>
                            <Link href="#">포토리뷰3</Link>
                        </div>
                        <div>
                            <Link href="#">포토리뷰4</Link>
                        </div>
                        <div>
                            <Link href="#">포토리뷰5</Link>
                        </div>
                    </div>
                    <hr style={{ marginTop: '100px' }} />
                </div>
                <div ref={reviewTopRef} aria-hidden>
                    <h3>리뷰</h3>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <h4>번호 / 작성일 / 별점 / userId(이름)/ 좋아요버튼 / 삭제버튼</h4>
                    {reviews.length === 0 ? (
                        <p>현재 작성된 리뷰가 없습니다.</p>
                    ) : (
                        <ul>
                            {/* {currentReviews.map((review) => ( */}
                            {reviews.map((review) => (
                                <li key={review.reviewId} style={{ marginBottom: '20px' }}>
                                    {review.reviewId} / {review.createdDate} /{review.rating} /{review.userId}(
                                    {review.createdBy}) /
                                    <button
                                        onClick={() => handleLikeClick(review.reviewId)}
                                        style={{
                                            backgroundColor: '#FF8080',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '6px 14px',
                                            marginTop: '5px',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d66464ff')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF8080')}
                                    >
                                        ♡ {likeCounts[review.reviewId] ?? review.reviewLike}
                                    </button>{' '}
                                    /<button onClick={() => handleDeleteClick(review.reviewId)}>삭제</button>
                                    <br />
                                    <h4 style={{ margin: '5px' }}>📃 리뷰 내용 </h4>
                                    <div
                                        onClick={() => (window.location.href = `/review/${review.reviewId}`)}
                                        style={{
                                            display: '-webkit-box',
                                            width: '800px',
                                            height: '80px',
                                            border: '1px solid #ccc',
                                            borderRadius: '8px',
                                            padding: '5px',
                                            resize: 'none',
                                            overflow: 'hidden',
                                            whiteSpace: 'normal',
                                            wordBreak: 'keep-all',
                                            WebkitLineClamp: '4',
                                            WebkitBoxOrient: 'vertical',
                                            textOverflow: 'ellipsis',
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            transition: '.3s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                    >
                                        {/* <div><Link href={`/review/${review.reviewId}`}></Link>{' '}</div> */}
                                        <div>{review.content}</div>
                                    </div>
                                    {/* ✅ 댓글 표시 */}
                                    <h4 style={{ margin: '5px' }}>💬 댓글</h4>
                                    <div
                                        style={{
                                            marginTop: '8px',
                                            width: '800px',
                                            height: '30px',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px',
                                            padding: '5px',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {' '}
                                        {comments[review.reviewId]?.reviewComment
                                            ? comments[review.reviewId].reviewComment
                                            : '아직 등록된 댓글이 없습니다.(성공 후 db엔 저장됨)'}
                                    </div>
                                    {/* 댓글달기 버튼 */}
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
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
                                                    window.location.href = '/auth/login'
                                                }
                                                return
                                            }
                                            setActiveCommentBox(
                                                activeCommentBox === review.reviewId ? null : review.reviewId,
                                            )
                                        }}
                                    >
                                        💬 댓글 달기
                                    </button>
                                    {/* ✅ 로그인 상태에서만 댓글 입력창 표시 */}
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
                                                    resize: 'none',
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
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* 페이지네이션 */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => {
                            if (currentPage > 0) fetchReviews(currentPage - 1)
                            scrollToTop
                        }}
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
                                cursor: currentPage === index ? 'default' : 'pointer',
                                fontWeight: currentPage === index ? 'bold' : 'normal',
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => {
                            if (currentPage + 1 < totalPages) fetchReviews(currentPage + 1)
                            scrollToTop()
                        }}
                        disabled={currentPage + 1 >= totalPages}
                        style={{
                            marginLeft: '10px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                    >
                        다음 ▶
                    </button>
                </div>
            </>
        </div>
    )
}
