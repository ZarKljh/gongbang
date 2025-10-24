"use client";
// 조회 테스트용. 리뷰 상세 페이지가 필요한가 고민중

import { useParams } from "next/navigation";
import { useState, useEffect} from "react";
import Link from "next/link";

export default function ReviewDetail() {
  const params = useParams();
  const [review, setReviews] = useState({});
  const [member, setmember] = useState({});

  useEffect(() => {
fetch(
      `http://localhost:8090/api/v1/reviews/${params.id}`
    )
      .then((result) => result.json())
      .then((result) => setReviews(result.data.review))
      .catch((err) => console.error(err)); //실패시
  }, []);
  
  return  <>
  <h4>리뷰 상세 {params.id}번</h4>
  <div>{review.content}</div>
  <div>{review.createdAt}</div>
  <div text="수정됨">{review.modifiedAt}</div>
  <Link href={`/review/${params.id}/modify`}>수정</Link>
  </>
}