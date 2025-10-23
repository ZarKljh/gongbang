"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Review() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
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
      <ReviewForm fetchReviews={fetchReviews} />

      <h4>번호 / 후기 내용 / 생성일 / 별점 / 유저이름</h4>
      {reviews.length === 0 ? (
        <p>현재 작성된 리뷰가 없습니다.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              {review.id} /
              <Link href={`/review/${review.id}`}>{review.content}</Link> /
              {review.createdAt} /{review.rating} / /{review.username || "익명"}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/////////////// 리뷰 작성 폼/////////////////

function ReviewForm({ fetchReviews }) {

  const [idCounter, setIdCounter] = useState({
    orderId: 1,
    orderItemId: 1,
    productId: 1,
    userId: 1
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

    // 등록할 때마다 ID 자동 증가 (test용)
    const nextIds = {
      orderId: idCounter.orderId + 1,
      orderItemId: idCounter.orderItemId + 1,
      productId: idCounter.productId + 1,
      userId: idCounter.userId + 1
    };

    const reviewToSend = {
      ...review,
      ...nextIds
    };

    try {
      const response = await fetch("http://localhost:8090/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewToSend),
      });

      if (response.ok) {
        alert("리뷰가 등록 되었습니다.");
        fetchReviews();

        setReview({
          orderId: 1,
          orderItemId: 1,
          productId: 1,
          userId: 1,
          rating: 0,
          content: "",
        });

        // 다음 등록 시 ID 자동 증가값 유지
        setIdCounter(nextIds);
    
      } else {
        alert("fail");
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
        <input type="submit" value="등록" onChange={handleChange} />
      </form>
    </div>
  );
}
