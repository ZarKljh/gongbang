package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@SuperBuilder
public class CartResponse {

    private Long cartId;
    private SiteUser siteUser;
    private Product product;
    private String productName; // Product 엔티티에서 가져올 예정
    private Long quantity;
    private LocalDateTime createdAt;
}