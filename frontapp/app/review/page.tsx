"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/app/utils/api"; // 

export default function Review() {
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태

  useEffect(() => {
    checkLoginStatus(); // 로그인 확인
    fetchReviews(); // 리뷰 목록 불러오기
  }, []);

  // 로그인 여부 확인
  const checkLoginStatus = async () => {
 try {
    const res = await fetch("http://localhost:8090/api/auth/me", {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  } catch {
    setIsLoggedIn(false);
  }
  };

  // 리뷰 목록 조회
  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      setReviews(res.data.data.reviews || []);
    } catch (err) {
      console.error("리뷰 목록 조회 실패:", err);
    }
  };

  // 리뷰 작성 버튼 클릭 시 동작
  const handleCreateClick = async () => {
    if (!isLoggedIn) {
      if (confirm("리뷰를 작성하려면 로그인이 필요합니다. 로그인 하시겠습니까?")) {
        window.location.href = "/auth/login";
      }
    } else {
      window.location.href = "/review/create";
    }
  };

  return (
    <>
      {/* 제목 + 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>리뷰 목록</h3>
        <button
          onClick={handleCreateClick}
          style={{
            backgroundColor: "#bfbfbf",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
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
            <li key={review.id}>
              {review.id} /{" "}
              <Link href={`/review/${review.id}`}>{review.content}</Link> /{" "}
              {review.createdDate} / {review.rating} / {review.userId}({review.createdBy})
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
