package com.gobang.gobang.domain.mypage.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersRequest {

    private Long userId;
    private Long deliveryAddressId;
    private BigDecimal totalPrice;
    private List<OrderItemRequest> orderItems;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private Long productId;
        private Long quantity;
        private BigDecimal price;
    }
}
