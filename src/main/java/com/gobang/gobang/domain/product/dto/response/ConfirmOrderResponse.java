package com.gobang.gobang.domain.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ConfirmOrderResponse {
    private String orderId;
    private String paymentKey;
    private Long amount;
    private String status;  // 예: "DONE", "SUCCESS", "PAID"
    private String message;      // 프론트에서 띄울 안내 메시지
}
