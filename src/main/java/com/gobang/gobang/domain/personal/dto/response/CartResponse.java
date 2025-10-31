package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.Cart;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class CartResponse {

    private Long cartId;
    private SiteUser siteUser;
    private Product product;
    private String productName;
    private Long quantity;
    private LocalDateTime createdAt;

    public static CartResponse from(Cart cart) {
        return CartResponse.builder()
                .cartId(cart.getCartId())
                .siteUser(cart.getSiteUser())
                .product(cart.getProduct())
                .productName(cart.getProduct().getName())
                .quantity(cart.getQuantity())
                .createdAt(cart.getCreatedAt())
                .build();
    }
}