package com.gobang.gobang.domain.review.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewCreateRequestDto {
    private Long orderId;
    private Long orderItemId;
    private Long productId;
    private Long userId;
    private Integer rating;
    private String content;
}
