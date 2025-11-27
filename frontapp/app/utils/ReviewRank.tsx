"use client";

import "./reviewRank.css";

interface ReviewRank {
  img?: string;
  name: string;       // 상품명
  rating: number;     // 평균 별점
  reviewCount: number; // 리뷰 수
  price: number;      // 가격
}

export default function ReviewRank() {
  // 더미 데이터 (나중에 API 연결)
  const reviews: ReviewRank[] = [
    { name: "핸드메이드 도자기 머그컵", rating: 4.8, reviewCount: 230, price: 18900 },
    { name: "미니 크로쉐 코스터", rating: 4.7, reviewCount: 155, price: 5900 },
    { name: "원목 캔들 홀더", rating: 4.9, reviewCount: 312, price: 15900 },
    { name: "감성 드로잉 엽서 세트", rating: 4.6, reviewCount: 201, price: 4900 },
  ];

  return (
    <section className="review-rank-container">
      <div className="review-rank-header">'강추'리뷰 100개 이상!</div>
      <div className="review-rank-sub">리뷰가 보장하는 상품이에요</div>

      <div className="review-rank-list">
        {reviews.map((p, i) => (
          <div key={i} className="review-rank-card">
            <div className="review-rank-image-wrapper">
              {p.img ? (
                <img src={p.img} alt="상품 이미지" />
              ) : (
                <span className="review-rank-image-placeholder">이미지 없음</span>
              )}
            </div>

            {/* 상품명 */}
            <p className="review-rank-title">{p.name}</p>

            {/* 별점 + 리뷰수 */}
            <div className="review-rank-rating">
              ⭐ {p.rating} ({p.reviewCount.toLocaleString()}개)
            </div>

            {/* 가격 */}
            <p className="review-rank-price">{p.price.toLocaleString()}원</p>
          </div>
        ))}
      </div>
    </section>
  );
}
