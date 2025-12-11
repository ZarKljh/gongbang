package com.gobang.gobang.domain.delivery.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderTrackingDetailResponse {

    private final Long orderId;
    private final String orderCode;
    private final LocalDateTime orderCreatedDate;
    private final String orderStatus;

    private final String deliveryStatus;
    private final String courierName;
    private final String trackingNumber;
    private final String location;
    private final String status;
    private  final LocalDateTime time;

    private final String productBrand;      // 공방명 / 브랜드명 등
    private final String productName;
    private final String productOption;
    private final Integer productPrice;
    private final Integer productQuantity;
    private final String productImageUrl;

    private final List<TrackingStepDto> steps;
}
