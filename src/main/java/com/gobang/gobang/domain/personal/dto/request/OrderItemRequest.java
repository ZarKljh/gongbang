package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    private Product product;
    private Long quantity;
    private BigDecimal price;
}