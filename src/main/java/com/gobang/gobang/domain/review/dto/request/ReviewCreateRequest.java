package com.gobang.gobang.domain.review.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCreateRequest {

    @NotNull(message = "주문 ID는 필수입니다.")
    @Positive
    private Long orderId;

    @NotNull(message = "주문 상품 ID는 필수입니다.")
    @Positive
    private Long orderItemId;

    @NotNull(message = "상품 ID는 필수입니다.")
    @Positive
    private Long productId;

//    @NotNull(message = "사용자 ID는 필수입니다.")
//    @Positive
//    private Long userId;

    private String createdBy;  // 인증된 사용자 정보로 자동 세팅 가능 (선택)

    @NotNull(message = "평점은 필수입니다.")
    @Positive
    private Integer rating;

    @NotBlank(message = "리뷰 내용을 입력해주세요.")
    private String content;


    private LocalDateTime createdDate;

    private LocalDateTime modifiedDate;
}