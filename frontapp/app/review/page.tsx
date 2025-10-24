"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Review() {
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태

  function getCookie(name) {
  const cookieArr = document.cookie.split("; ");
  for (let cookie of cookieArr) {
    const [key, value] = cookie.split("=");
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}
  useEffect(() => {
    // // 로그인 여부 확인 
    const token = getCookie("accessToken");
    setIsLoggedIn(!!token);

    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const result = await fetch("http://localhost:8090/api/v1/reviews");
      const data = await result.json();


      // 배열 꺼내기
      setReviews(data.data.reviews || []);
    } catch (err) {
      console.error("error", err);
    }
  };

  return (
    <>
      {/* ✅ 로그인한 경우에만 작성폼 표시 */}
      {isLoggedIn ? (
        <ReviewForm fetchReviews={fetchReviews} />
      ) : (
        <p style={{ color: "gray" }}>
          리뷰를 작성하려면 <Link href="/auth/login">로그인</Link>이 필요합니다.
        </p>
      )}

      <h4>번호 / 후기 내용 / 생성일 / 별점 / 유저이름(현재는Id)</h4>
      {reviews.length === 0 ? (
        <p>현재 작성된 리뷰가 없습니다.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              {review.id} /
              <Link href={`/review/${review.id}`}>{review.content}</Link> /
              {review.createdAt} / {review.rating} /{" "}
              {/* 추후username으로 바꿀것 */}
              {review.userId} 
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/////////////// 리뷰 작성 폼 ///////////////////

function ReviewForm({ fetchReviews }) {
  const [idCounter, setIdCounter] = useState({
    orderId: 1,
    orderItemId: 1,
    productId: 1,
    userId: 1,
  });
  const [review, setReview] = useState({
    orderId: 1,
    orderItemId: 1,
    productId: 1,
    userId: 1,
    rating: 0,
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "rating" ? Number(value) : value;

    setReview((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (review.rating < 1) {
      alert("별점을 선택해주세요. (1~5)");
      return;
    }
    if (!review.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // 등록할 때마다 ID 자동 증가 (테스트용)
    const nextIds = {
      orderId: idCounter.orderId + 1,
      orderItemId: idCounter.orderItemId + 1,
      productId: idCounter.productId + 1,
      userId: idCounter.userId + 1,
    };

    const reviewToSend = {
      ...review,
      ...nextIds,
    };

    try {
      const token = localStorage.getItem("accessToken"); // 로그인 토큰 포함
      const response = await fetch("http://localhost:8090/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(reviewToSend),
        credentials: "include"
      });

      if (response.ok) {
        alert("리뷰가 등록되었습니다.");
        fetchReviews();

        setReview({
          orderId: 1,
          orderItemId: 1,
          productId: 1,
          userId: 1,
          rating: 0,
          content: "",
        });

        setIdCounter(nextIds);
      } else if (response.status === 401) {
        alert("로그인이 필요합니다.");
      } else {
        alert("리뷰 등록 실패");
      }
    } catch (err) {
      console.error("error", err);
    }
  };

  return (
    <div>
      <h4>리뷰 작성</h4>
      <form onSubmit={handleSubmit}>
        {[1, 2, 3, 4, 5].map((num) => (
          <label key={num}>
            <input
              type="radio"
              name="rating"
              value={num}
              checked={review.rating === num}
              onChange={handleChange}
            />
            {num}점
          </label>
        ))}
        <br />
        <label>
          내용 :
          <input
            type="text"
            name="content"
            minLength={5}
            onChange={handleChange}
            value={review.content}
            placeholder="5자 이상 300자 이하"
          />
        </label>
        <br />
        <input type="submit" value="등록" />
      </form>
    </div>
  );
}
