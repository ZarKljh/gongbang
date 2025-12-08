package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.Orders;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Comparator;
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
    private String status;
    private String reason;
    private List<OrderItemResponse> items;
    private List<DeliveryResponse> deliveries;

    public static OrdersResponse from(Orders orders, ImageRepository imageRepository) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // createdDate
        String createdDateStr = orders.getCreatedDate() != null
                ? orders.getCreatedDate().format(formatter)
                : LocalDateTime.now().format(formatter);

        // items
        List<OrderItemResponse> items = orders.getOrderItems()
                .stream()
                .map(item -> OrderItemResponse.from(item, imageRepository))
                .toList();

        // deliveries (response용)
        List<DeliveryResponse> deliveries = orders.getDeliveries() != null
                ? orders.getDeliveries().stream().map(DeliveryResponse::from).toList()
                : Collections.emptyList();

        // 🚀 가장 최근 Delivery (createdDate 기준)
        Delivery latest = orders.getDeliveries() != null && !orders.getDeliveries().isEmpty()
                ? orders.getDeliveries().stream()
                .max(Comparator.comparing(Delivery::getCreatedDate))
                .orElse(null)
                : null;

        // 배송상태
        String deliveryStatus = latest != null ? latest.getDeliveryStatus() : "배송준비중";

        // 배송완료 날짜 (문자열로 변환)
        String completedAt = (latest != null && latest.getCompletedAt() != null)
                ? latest.getCompletedAt().format(formatter)
                : null;

        return OrdersResponse.builder()
                .orderId(orders.getOrderId())
                .userId(orders.getSiteUser() != null ? orders.getSiteUser().getId() : 0L)
                .orderCode(orders.getOrderCode() != null ? orders.getOrderCode() : "N/A")
                .totalPrice(orders.getTotalPrice() != null ? orders.getTotalPrice() : BigDecimal.ZERO)
                .createdDate(createdDateStr)
                .deliveryStatus(deliveryStatus)
                .completedAt(completedAt)   // ⭐ 정상 문자열
                .status(orders.getStatus())
                .reason(orders.getReason())
                .items(items)
                .deliveries(deliveries)
                .build();
    }
}
