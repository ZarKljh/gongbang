package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrdersRequest {

    private SiteUser siteUser;
    private Long deliveryAddressId;
    private BigDecimal totalPrice;
    private List<OrderItemRequest> orderItems;
    private String reason;
}