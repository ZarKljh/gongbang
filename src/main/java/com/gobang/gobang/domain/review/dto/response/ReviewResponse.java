package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ReviewResponse {
//    private final Review review;

    private Long reviewId;
    private String content;
    private Integer rating;
    private Integer reviewLike;
    private Integer viewCount;
    private Boolean isActive;
    private LocalDateTime createdDate;
    private String createdBy;
    private String userNickName; // ✅ siteUser 닉네임만 노출
    private Long userId;         // ✅ siteUser ID 추가 (수정/삭제 비교용)

    // ✅ Review 엔티티 → DTO 변환
    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .content(review.getContent())
                .rating(review.getRating())
                .reviewLike(review.getReviewLike())
                .viewCount(review.getViewCount())
                .isActive(review.getIsActive())
                .createdDate(review.getCreatedDate())
                .createdBy(review.getCreatedBy())
                .userNickName(review.getSiteUser().getNickName())
                .userId(review.getSiteUser().getId())
                .build();
    }
}
