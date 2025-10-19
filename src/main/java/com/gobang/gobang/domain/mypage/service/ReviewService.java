package com.gobang.gobang.domain.mypage.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    // 문의 내역 리스트 조회
    public List<Map<String, Object>> getInquiriesList() {
        // 내가 작성한 문의 내역 조회
        return List.of(
                Map.of(
                        "inquiryId", 1L,
                        "productId", 101L,
                        "productName", "도자기 머그컵",
                        "title", "배송 문의",
                        "content", "배송은 언제 되나요?",
                        "status", "답변완료",
                        "createdAt", "2024-10-15",
                        "answeredAt", "2024-10-16"
                ),
                Map.of(
                        "inquiryId", 2L,
                        "productId", 102L,
                        "productName", "가죽 지갑",
                        "title", "사이즈 문의",
                        "content", "실제 크기가 어떻게 되나요?",
                        "status", "답변대기",
                        "createdAt", "2024-10-18"
                )
        );
    }

    // 리뷰 리스트 조회
    public List<Map<String, Object>> getReviewsList() {
        // 내가 작성한 리뷰 목록 조회
        return List.of(
                Map.of(
                        "reviewId", 1L,
                        "orderId", 1L,
                        "productId", 101L,
                        "productName", "도자기 머그컵",
                        "rating", 5,
                        "content", "너무 예쁘고 만족스러워요!",
                        "imageUrls", List.of("/images/review1.jpg"),
                        "createdAt", "2024-10-10",
                        "sellerName", "행복공방"
                ),
                Map.of(
                        "reviewId", 2L,
                        "orderId", 2L,
                        "productId", 102L,
                        "productName", "가죽 지갑",
                        "rating", 4,
                        "content", "품질은 좋은데 배송이 조금 늦었어요.",
                        "imageUrls", List.of(),
                        "createdAt", "2024-09-20",
                        "sellerName", "가죽공작소"
                )
        );
    }

    // 리뷰 수정
    public void updateReview(Long reviewId, Map<String, Object> reviewData) {
        // 리뷰 존재 여부 확인
        // 작성자 본인인지 확인
        // 수정 가능 기간 확인 (작성 후 N일 이내)
        // 내용, 평점, 이미지 수정
        // DB 업데이트
    }

    // 리뷰 삭제
    public void deleteReview(Long reviewId) {
        // 리뷰 존재 여부 확인
        // 작성자 본인인지 확인
        // 리뷰 삭제 (soft delete 권장)
        // 상품 평점 재계산
    }
}