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
    private String buyerNickname;   // 셀러 페이지에서 볼 구매자 닉네임 - 상진 추가

    private String courierName;
    private String trackingNumber;

    private List<OrderItemResponse> items;
    private List<DeliveryResponse> deliveries;

    public static OrdersResponse from(Orders orders, ImageRepository imageRepository) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        String createdDateStr = orders.getCreatedDate() != null
                ? orders.getCreatedDate().format(formatter)
                : LocalDateTime.now().format(formatter);

        List<DeliveryResponse> deliveries = orders.getDeliveries() != null
                ? orders.getDeliveries().stream().map(DeliveryResponse::from).toList()
                : Collections.emptyList();

        List<OrderItemResponse> items = orders.getOrderItems()
                .stream()
                .map(item -> OrderItemResponse.from(item, imageRepository))
                .toList();

        Delivery latestDelivery = null;
        if (orders.getDeliveries() != null && !orders.getDeliveries().isEmpty()) {
            latestDelivery = orders.getDeliveries().stream()
                    .max(Comparator.comparing(Delivery::getCreatedDate))
                    .orElse(null);
        }



        // OrdersResponse.from
        String deliveryStatus = orders.getDeliveries() != null && !orders.getDeliveries().isEmpty()
                ? orders.getDeliveries().stream()
                .max(Comparator.comparing(Delivery::getCreatedDate))
                .get()
                .getDeliveryStatus()
                : "배송준비중";

        String courierName =
                latestDelivery != null ? latestDelivery.getCourierName() : null;

        String trackingNumber =
                latestDelivery != null ? latestDelivery.getTrackingNumber() : null;

        String completedAt = deliveries.isEmpty() || deliveries.get(deliveries.size() - 1).getCompletedAt() == null
                ? null
                : deliveries.get(deliveries.size() - 1).getCompletedAt();

        return OrdersResponse.builder()
                .orderId(orders.getOrderId())
                .userId(orders.getSiteUser() != null ? orders.getSiteUser().getId() : 0L)
                .orderCode(orders.getOrderCode() != null ? orders.getOrderCode() : "N/A")
                .totalPrice(orders.getTotalPrice() != null ? orders.getTotalPrice() : BigDecimal.ZERO)
                .createdDate(createdDateStr)
                .deliveryStatus(deliveryStatus)
                .completedAt(completedAt)
                .status(orders.getStatus())
                .reason(orders.getReason())
                .buyerNickname(
                        orders.getSiteUser() != null
                                ? orders.getSiteUser().getNickName()
                                : null
                )
                .courierName(courierName)
                .trackingNumber(trackingNumber)
                .items(items)
                .deliveries(deliveries)
                .build();
    }
}
