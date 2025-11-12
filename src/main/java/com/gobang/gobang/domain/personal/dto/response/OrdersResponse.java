package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.Delivery;
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
    private String deliveryStatus;

    public static OrdersResponse from(Orders orders) {
        String deliveryStatus = "배송준비중"; // 기본값
        LocalDateTime createdDate = null;

        if (orders.getDeliveries() != null && !orders.getDeliveries().isEmpty()) {
            // 최신 배송을 찾는다 (createdDate 기준 내림차순)
            Delivery latestDelivery = orders.getDeliveries().stream()
                    .max((a, b) -> a.getCreatedDate().compareTo(b.getCreatedDate()))
                    .orElse(null);

            if (latestDelivery != null) {
                deliveryStatus = latestDelivery.getDeliveryStatus();
                createdDate = latestDelivery.getCreatedDate();

                // 배송완료 후 7일이 지난 경우 표시 제외
                if ("배송완료".equals(deliveryStatus)
                        && latestDelivery.getCompletedAt() != null
                        && latestDelivery.getCompletedAt().isBefore(LocalDateTime.now().minusDays(7))) {
                    // 7일 지난 배송완료는 표시하지 않음 (null 반환)
                    return null;
                }
            }
        }

        return OrdersResponse.builder()
                .orderId(orders.getOrderId())
                .userId(orders.getSiteUser().getId())
                .orderCord(orders.getOrderCord())
                .totalPrice(orders.getTotalPrice())
                .createdDate(createdDate)
                .deliveryStatus(deliveryStatus)
                .build();
    }
}
