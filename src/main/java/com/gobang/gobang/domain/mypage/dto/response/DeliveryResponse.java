package com.gobang.gobang.domain.mypage.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
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
}