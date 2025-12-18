package com.gobang.gobang.domain.personal.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentCancelRequest {
    private String orderCode;
}
