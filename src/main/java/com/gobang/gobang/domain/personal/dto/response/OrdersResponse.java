package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@SuperBuilder
public class OrdersResponse {

    private Long orderId;
    private SiteUser siteUser;
    private String orderCord;
    private BigDecimal totalPrice;
    private LocalDateTime createdDate;
}
