package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.Orders;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class OrdersResponse {

    private Long orderId;
    private Long userId;
    private String orderCord;
    private BigDecimal totalPrice;
    private LocalDateTime createdDate;

    public static OrdersResponse from(Orders orders) {
        return OrdersResponse.builder()
                .orderId(orders.getOrderId())
                .userId(orders.getSiteUser().getId())
                .orderCord(orders.getOrderCord())
                .totalPrice(orders.getTotalPrice())
                .build();
    }
}
