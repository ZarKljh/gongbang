package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrdersRequest {

    private SiteUser siteUser;
    private Long deliveryAddressId;
    private BigDecimal totalPrice;
    private List<OrderItemRequest> orderItems;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private Product product;
        private Long quantity;
        private BigDecimal price;
    }
}
