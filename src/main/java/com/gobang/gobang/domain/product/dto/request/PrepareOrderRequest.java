package com.gobang.gobang.domain.product.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrepareOrderRequest {
    private Long productId;
    private Long quantity;
}
