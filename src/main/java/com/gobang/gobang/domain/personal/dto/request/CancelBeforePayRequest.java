package com.gobang.gobang.domain.personal.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelBeforePayRequest {
    private String orderCode;
}
