package com.gobang.gobang.domain.personal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PrepareOrderResponse {
    private String orderCode;
    private Long totalPrice;
}