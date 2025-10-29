'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import api from '@/app/utils/api' //

export default function Review() {
    const [reviews, setReviews] = useState([])
    const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태
    const [activeCommentBox, setActiveCommentBox] = useState(null)
    const [reviewComment, setReviewComment] = useState(null)

    useEffect(() => {
        checkLoginStatus() // 로그인 확인
        fetchReviews() // 리뷰 목록 불러오기
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

    // 리뷰 목록 조회
    const fetchReviews = async () => {
        try {
            const res = await api.get('/reviews')
            setReviews(res.data.data.reviews || [])
        } catch (err) {
            console.error('리뷰 목록 조회 실패:', err)
        }
    }

    // 리뷰 작성 버튼 클릭 시 동작
    const handleCreateClick = async () => {
        if (!isLoggedIn) {
            if (confirm('리뷰를 작성하려면 로그인이 필요합니다. 로그인 하시겠습니까?')) {
                window.location.href = '/auth/login'
            }
        } else {
            window.location.href = '/review/create'
        }
    }

    // 리뷰 댓글 달기 버튼 클릭 시 동작
      const handleCommentSubmit = async (reviewId) => {
    if (!reviewComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8090/api/v1/reviews/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          review_id: reviewId,
          reviewComment: reviewComment,
        }),
      });

      if (res.ok) {
        alert("댓글이 등록되었습니다.");
        setReviewComment("");
        setActiveCommentBox(null); // 입력창 닫기
      } else if (res.status === 401) {
        alert("로그인이 필요합니다.");
        window.location.href = "/auth/login";
      } else {
        alert("댓글 등록 실패");
      }
    } catch (err) {
      console.error("댓글 등록 에러:", err);
    }
  };

    return (
        <>
            {/* 제목 + 버튼 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h3>리뷰 목록</h3>
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

            {/* 리뷰 목록 */}
            <h4>번호 / 후기 내용 / 작성일 / 별점 / userId(이름) </h4>
            {reviews.length === 0 ? (
                <p>현재 작성된 리뷰가 없습니다.</p>
            ) : (
                <ul>
                    {reviews.map((review) => (
                        <li key={review.reviewId}>
                            {review.reviewId} / <Link href={`/review/${review.reviewId}`}>{review.content}</Link> /{' '}
                            {review.createdDate} / {review.rating} / {review.userId}({review.createdBy})
                            <br />
                            <div>댓글 내용 들어갈 자리</div>
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
                                    setActiveCommentBox(activeCommentBox === review.reviewId ? null : review.reviewId)
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
                                        value={reviewComment || ""}
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
        </>
    )
}
