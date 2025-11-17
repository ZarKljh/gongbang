package com.gobang.gobang.domain.product.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
public class ReviewRatingDto {
    private Long productId;
    private Double avgRating;
    private Long ratingCount;

    // ✅ Hibernate가 찾는 생성자 (순서/타입 중요!!)
    public ReviewRatingDto(Long productId, Double avgRating, Long ratingCount) {
        this.productId = productId;
        this.avgRating = avgRating;
        this.ratingCount = ratingCount;
    }
}