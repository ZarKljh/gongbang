package com.gobang.gobang.domain.personal.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TossPaymentResponse {

    private String paymentKey;
    private String orderId;
    private String status;
    private Long totalAmount;
    private String method;

    public boolean isPaid() {
        return "DONE".equals(status);
    }
}