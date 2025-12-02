package com.gobang.gobang.domain.product.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TossConfirmRequest {
    private String orderId;      // Toss에서 내려오는 orderCode
    private String paymentKey;
    private BigDecimal amount;
}
