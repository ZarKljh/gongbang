package com.gobang.gobang.domain.personal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartOrderItemDto {
    private Long cartId;
    private Long productId;
    private Long quantity;
}