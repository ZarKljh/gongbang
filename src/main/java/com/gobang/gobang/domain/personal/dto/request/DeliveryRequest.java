package com.gobang.gobang.domain.personal.dto.request;

import lombok.*;

@Data
public class DeliveryRequest {

    private Long deliveryId;
    private String trackingNumber;
    private String deliveryStatus;
}
