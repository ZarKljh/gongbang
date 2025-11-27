"use client";

import "./reviewRank.css";

interface ReviewProps {
  img?: string;
  content: string;
  author: string;
}

export default function ReviewRank() {
  // 더미 데이터 (나중에 API 연결)
  const reviews: ReviewProps[] = [
    { content: "친구 선물로 줬는데 너무 좋아했어요!", author: "현*영" },
    { content: "디자인이 정말 예쁘고 퀄리티 좋아요!", author: "JY*" },
    { content: "가격 대비 만족도가 매우 높습니다.", author: "별*님" },
    { content: "배송도 빠르고 실물이 더 예뻐요!", author: "호*리" },
  ];

  return (
    <section className="review-rank-container">
      <div className="review-rank-header">'강추'리뷰 100개 이상!</div>
      <div className="review-rank-sub">리뷰가 보장하는 상품이에요</div>

      <div className="review-rank-list">
        {reviews.map((r, i) => (
          <div key={i} className="review-rank-card">
            <div className="review-rank-image-wrapper">
              {r.img ? (
                <img src={r.img} alt="리뷰 이미지" />
              ) : (
                <span className="review-rank-image-placeholder">
                  리뷰 이미지
                </span>
              )}
            </div>

            <p className="review-rank-title">{r.content}</p>
            <p className="review-rank-author">{r.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
