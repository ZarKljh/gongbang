package com.gobang.gobang.domain.delivery.dto;

import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.Orders;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class SellerDeliveryDetailResponse {

    private Long orderId;
    private String orderCode;
    private LocalDateTime createdDate;
    private BigDecimal totalPrice;
    private String buyerNickname;

    private String deliveryStatus;
    private String courierName;
    private String trackingNumber;

    public static SellerDeliveryDetailResponse of(Orders order, Delivery delivery) {
        return SellerDeliveryDetailResponse.builder()
                .orderId(order.getOrderId())
                .orderCode(order.getOrderCode())
                .createdDate(order.getCreatedDate())
                .totalPrice(order.getTotalPrice())
                .buyerNickname(order.getSiteUser() != null ? order.getSiteUser().getNickName() : null)
                .deliveryStatus(delivery != null ? delivery.getDeliveryStatus() : null)
                .courierName(delivery != null ? delivery.getCourierName() : null)
                .trackingNumber(delivery != null ? delivery.getTrackingNumber() : null)
                .build();
    }
}
