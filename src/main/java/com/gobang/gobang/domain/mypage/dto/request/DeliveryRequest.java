package com.gobang.gobang.domain.mypage.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryRequest {

    private Long deliveryId;
    private String trackingNumber;
    private String deliveryStatus;
}
