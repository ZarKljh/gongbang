"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Review() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const result = await fetch("http://localhost:8090/api/v1/reviews")
    .then((result) => result.json())
    .then((result) => setReviews(result.data.reviews))
    .catch(err => console.error(err));//실패시
  };
return (
    <>
    {/* <ReviewForm fetchReviews ={fetchReviews}/> */}
    <h4>번호 / 후기 내용 / 생성일 / 좋아요 / 유저이름(아직 없음)</h4>
    {reviews.length == 0? (
        <p>현재 작성된 리뷰가 없습니다.</p>
    ) : (
        <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            {review.id} /
            <Link href={`/review/${review.id}`}>{review.content}</Link>/
            {review.createdAt}/
            {review.rating}
            {/* username은 아직 없음 */}
            {review.username}
            
            {/* <button onClick={() => handleDelete(review.id)}>삭제</button> */}
          </li>
        ))}
      </ul>
    )}
    </>
  );
}