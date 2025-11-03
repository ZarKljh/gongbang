package com.gobang.gobang.domain.personal.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gobang.gobang.domain.review.entity.Review;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long reviewId;
    private Long productId;
    private Integer rating;
    private String content;
    private Integer reviewLike;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime modifiedDate;

    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .productId(review.getProductId())
                .rating(review.getRating())
                .content(review.getContent())
                .reviewLike(review.getReviewLike())
                .createdDate(review.getCreatedDate())
                .modifiedDate(review.getModifiedDate())
                .build();
    }
}