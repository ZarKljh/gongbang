package com.gobang.gobang.domain.mypage.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long orderItemId;
    private Long orderId;
    private Long productId;
    private String productName;
    private Long quantity;
    private BigDecimal price;
}