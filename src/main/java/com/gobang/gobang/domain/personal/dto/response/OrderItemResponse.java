package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long orderItemId;
    private Long orderId;
    private Product product;
    private String productName;
    private Long quantity;
    private BigDecimal price;
}