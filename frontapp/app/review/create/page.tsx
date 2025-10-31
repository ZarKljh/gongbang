"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect} from "react";
import { FaStar } from "react-icons/fa";
import api from "@/app/utils/api";

export default function ReviewCreate({fetchReviews}) {
  const router = useRouter();
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
    setReview({ ...review, [name]: newValue });
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
      const res = await api.post("/reviews", review);
      if (res.status === 200 || res.status === 201) {
        alert("리뷰가 등록되었습니다.");
        router.push("/review");
      }
    } catch (err) {
        alert("리뷰 등록 실패");
      
    }
  };

  return (
    <div>
      <h2>리뷰 작성</h2>
      <form onSubmit={handleSubmit}>
        {[1, 2, 3, 4, 5].map((num) => (
<FaStar
                        key={num}
                        size={30}
                        style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
                        color={num <= review.rating ? '#FFD700' : '#E0E0E0'} // 선택 시 노란색, 미선택 회색
                        onClick={() =>
                            setReview((prev) => ({
                                ...prev,
                                rating: num,
                            }))
                            
                        }
                        
                    />
        ))}
        <br />
        <label>
          내용 :
          <textarea
            name="content"
            minLength={5}
            maxLength={300}
            onChange={handleChange}
            value={review.content}
            placeholder="5자 이상 300자 이하"
            style={{
              width: "400px",
              height: "150px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              resize: "none",
            }}
          />
        </label>
        <br />
        <input
          type="submit"
          value="등록"
          style={{
            backgroundColor: "#AD9263",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        />
      </form>
    </div>
  );
}
