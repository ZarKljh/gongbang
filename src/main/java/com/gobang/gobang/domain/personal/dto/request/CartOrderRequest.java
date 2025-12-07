package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.personal.dto.CartOrderItemDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CartOrderRequest {
    private List<CartOrderItemDto> items;
}