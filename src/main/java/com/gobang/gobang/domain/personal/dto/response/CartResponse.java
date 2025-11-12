package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.personal.entity.Cart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class CartResponse {

    private Long cartId;
    private Long userId;
    private Long productId;
    private String productName;
    private Integer price;
    private Long quantity;
    private LocalDateTime createdAt;

    public static CartResponse from(Cart cart) {
        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getSiteUser().getId())
                .productId(cart.getProduct().getId())
                .productName(cart.getProduct().getName())
                .price(cart.getProduct().getBasePrice())
                .quantity(cart.getQuantity())
                .createdAt(cart.getCreatedAt())
                .build();
    }
}