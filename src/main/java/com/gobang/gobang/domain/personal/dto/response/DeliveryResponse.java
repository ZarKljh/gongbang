package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.personal.entity.Delivery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
@Builder
public class DeliveryResponse {

    private Long deliveryId;
    private Long orderId;
    private Long addressId;
    private String trackingNumber;
    private String deliveryStatus;
    private String completedAt;
    private String createdDate;
    private String modifiedDate;

    // 배송지 정보
    private String recipientName;
    private String baseAddress;
    private String detailAddress;
    private String zipcode;

    public static DeliveryResponse from(Delivery delivery) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return DeliveryResponse.builder()
                .deliveryId(delivery.getDeliveryId())
                .orderId(delivery.getOrder().getOrderId())
                .addressId(delivery.getAddress().getUserAddressId())
                .trackingNumber(delivery.getTrackingNumber())
                .deliveryStatus(delivery.getDeliveryStatus())
                .completedAt(delivery.getCompletedAt() != null ? delivery.getCompletedAt().format(formatter) : null)
                .createdDate(delivery.getCreatedDate() != null ? delivery.getCreatedDate().format(formatter) : null)
                .modifiedDate(delivery.getModifiedDate() != null ? delivery.getModifiedDate().format(formatter) : null)
                .recipientName(delivery.getAddress().getRecipientName())
                .baseAddress(delivery.getAddress().getBaseAddress())
                .detailAddress(delivery.getAddress().getDetailAddress())
                .zipcode(delivery.getAddress().getZipcode())
                .build();
    }
}