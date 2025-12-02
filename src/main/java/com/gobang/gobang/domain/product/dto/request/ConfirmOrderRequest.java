package com.gobang.gobang.domain.product.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmOrderRequest {
    private String orderId;     // 프론트 orderId 그대로
    private String paymentKey;  // 프론트 paymentKey 그대로
    private Long amount;        // 또는 BigDecimal amount;
}
