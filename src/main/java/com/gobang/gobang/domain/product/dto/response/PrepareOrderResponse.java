package com.gobang.gobang.domain.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class PrepareOrderResponse {
    private String orderCode;   // Toss에 보낼 주문 번호
    private BigDecimal amount;  // 총 금액
}