package com.gobang.gobang.domain.review.dto;

import com.gobang.gobang.domain.review.entity.Review;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewDto {
    @Data
    public static class ReviewCreateRequest {

        @NotNull(message = "주문 ID는 필수입니다.")
        @Positive
        private Long orderId;

        @NotNull(message = "주문 상품 ID는 필수입니다.")
        @Positive
        private Long orderItemId;

        @NotNull(message = "상품 ID는 필수입니다.")
        @Positive
        private Long productId;

        @NotNull(message = "사용자 ID는 필수입니다.")
        @Positive
        private Long userId;

//        @NotNull(message = "사용자 이름은 필수입니다.")
//        @Positive
//        private String userName;

        @NotNull(message = "평점은 필수입니다.")
        @Positive
        private Integer rating;

        @NotBlank(message = "리뷰 내용을 입력해주세요.")
        private String content;

    }

    @Getter
    @AllArgsConstructor
    public static class CreateReviewResponse {
        private final Review review;
    }
}