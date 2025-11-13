package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.personal.entity.Orders;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class OrdersResponse {

    private Long orderId;
    private Long userId;
    private String orderCode;
    private BigDecimal totalPrice;
    private String createdDate;
    private String deliveryStatus;
    private LocalDateTime completedAt;
    private List<OrderItemResponse> items;

    public static OrdersResponse from(Orders orders) {
        String deliveryStatus = "배송준비중"; // 기본값

        String createdDateStr = orders.getCreatedDate() != null
                ? orders.getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                : "날짜 없음";

        List<OrderItemResponse> items = orders.getOrderItems().stream()
                .map(OrderItemResponse::from)
                .toList();

        LocalDateTime completedAt = null;
        if (orders.getDeliveries() != null && !orders.getDeliveries().isEmpty()) {
            if (orders.getDeliveries().get(0).getDeliveryStatus() != null) {
                deliveryStatus = orders.getDeliveries().get(0).getDeliveryStatus();
            }
            completedAt = orders.getDeliveries().get(0).getCompletedAt();
        }

        return OrdersResponse.builder()
                .orderId(orders.getOrderId())
                .userId(orders.getSiteUser().getId())
                .orderCode(orders.getOrderCode())
                .totalPrice(orders.getTotalPrice())
                .createdDate(createdDateStr)
                .deliveryStatus(deliveryStatus)
                .completedAt(completedAt)
                .items(items)
                .build();
    }
}
