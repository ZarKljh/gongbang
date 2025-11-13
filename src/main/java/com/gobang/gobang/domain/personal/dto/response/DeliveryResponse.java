package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.personal.entity.Delivery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class DeliveryResponse {

    private Long deliveryId;
    private Long orderId;
    private Long addressId;
    private String trackingNumber;
    private String deliveryStatus;
    private LocalDateTime completedAt;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    // 배송지 정보
    private String recipientName;
    private String baseAddress;
    private String detailAddress;
    private String zipcode;

    public static DeliveryResponse from(Delivery delivery) {
        return DeliveryResponse.builder()
                .deliveryId(delivery.getDeliveryId())
                .orderId(delivery.getOrder().getOrderId())
                .addressId(delivery.getAddress().getUserAddressId())
                .trackingNumber(delivery.getTrackingNumber())
                .deliveryStatus(delivery.getDeliveryStatus())
                .completedAt(delivery.getCompletedAt())
                .createdDate(delivery.getCreatedDate())
                .modifiedDate(delivery.getModifiedDate())
                .recipientName(delivery.getAddress().getRecipientName())
                .baseAddress(delivery.getAddress().getBaseAddress())
                .detailAddress(delivery.getAddress().getDetailAddress())
                .zipcode(delivery.getAddress().getZipcode())
                .build();
    }
}