'use client'
// 조회 테스트용. 리뷰 상세 페이지가 필요한가
// 필요할 거 같음. 내 정보 -> 내 리뷰 -> 내 리뷰 상세 페이지로 이동해야 할 거 같다.
// 이 안에서 삭제 수정, 리뷰 메인에서도 삭제 수정 가능

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ReviewDetail() {
    const params = useParams()
    const [review, setReviews] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태

    useEffect(() => {
        checkLoginStatus() // 로그인 확인
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

    // 리뷰 수정 버튼 클릭 시 동작
    const handleModifyClick = async () => {
        if (!isLoggedIn) {
            if (confirm('리뷰를 수정하려면 로그인이 필요합니다. 로그인 하시겠습니까?')) {
                window.location.href = '/auth/login'
            }
        } else {
            window.location.href = `/review/${params.id}/modify`
        }
    }

    useEffect(() => {
        fetch(`http://localhost:8090/api/v1/reviews/${params.id}`)
            .then((result) => result.json())
            .then((result) => setReviews(result.data.review))
            .catch((err) => console.error(err)) //실패시
    }, [])

    return (
        <>
            <h4>리뷰 상세 {params.id}번</h4>
            <div>내용 : {review.content}</div>
            <div>작성일 : {review.createdDate}</div>
            <div>수정일 : {review.modifiedDate}
              <small></small>
            </div>
            {/* <Link href={`/review/${params.id}/modify`}>수정</Link> */}
                    <button
          onClick={handleModifyClick}
          style={{
            backgroundColor: "#bfbfbf",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          리뷰 수정하기
        </button>
            <br />
            <Link href={`/review`}>목록으로</Link>
        </>
    )
}
