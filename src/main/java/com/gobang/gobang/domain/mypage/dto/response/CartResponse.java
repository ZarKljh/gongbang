package com.gobang.gobang.domain.mypage.dto.response;

import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    private Long cartId;
    private Long userId;
    private Long productId;
    private Product product;
    private String productName; // Product 엔티티에서 가져올 예정
    private Long quantity;
    private LocalDateTime createdAt;
}