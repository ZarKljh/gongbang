package com.gobang.gobang.domain.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateDeliveryRequest {

    // 택배사 이름
    @NotBlank
    private String courierName;
    // 송장 번호
    @NotBlank
    private String trackingNumber;

    // 옵션: 상태도 같이 바꾸고 싶으면
    private String deliveryStatus;
}
