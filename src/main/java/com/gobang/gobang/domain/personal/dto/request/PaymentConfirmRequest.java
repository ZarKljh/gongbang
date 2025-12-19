package com.gobang.gobang.domain.personal.dto.request;

import lombok.Getter;

@Getter
public class PaymentConfirmRequest {
    private String orderId;     // ORD_xxx
    private String paymentKey;    // PG에서 내려준 키
}