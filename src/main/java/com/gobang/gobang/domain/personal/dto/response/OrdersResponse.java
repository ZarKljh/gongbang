package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.Orders;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
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
    private String completedAt; // String으로 변경
    private List<OrderItemResponse> items;
    private List<DeliveryResponse> deliveries;

    public static OrdersResponse from(Orders orders) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // createdDate null 방어
        String createdDateStr = orders.getCreatedDate() != null
                ? orders.getCreatedDate().format(formatter)
                : LocalDateTime.now().format(formatter);

        // orderItems null 방어
        List<OrderItemResponse> items = orders.getOrderItems() != null
                ? orders.getOrderItems().stream().map(OrderItemResponse::from).toList()
                : Collections.emptyList();

        // deliveries null 방어
        List<DeliveryResponse> deliveries = orders.getDeliveries() != null
                ? orders.getDeliveries().stream().map(DeliveryResponse::from).toList()
                : Collections.emptyList();

        // 대표 배송 상태/완료일
        String deliveryStatus = deliveries.isEmpty()
                ? "배송준비중"
                : deliveries.get(0).getDeliveryStatus();

        String completedAt = deliveries.isEmpty() || deliveries.get(0).getCompletedAt() == null
                ? null
                : deliveries.get(0).getCompletedAt();

        return OrdersResponse.builder()
                .orderId(orders.getOrderId())
                .userId(orders.getSiteUser() != null ? orders.getSiteUser().getId() : 0L)
                .orderCode(orders.getOrderCode() != null ? orders.getOrderCode() : "N/A")
                .totalPrice(orders.getTotalPrice() != null ? orders.getTotalPrice() : BigDecimal.ZERO)
                .createdDate(createdDateStr)
                .deliveryStatus(deliveryStatus)
                .completedAt(completedAt)
                .items(items)
                .deliveries(deliveries)
                .build();
    }
}
