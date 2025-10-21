package com.gobang.gobang.domain.mypage.dto.request;

import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartRequest {

    private Long userId;
    private Long productId;
    private Product product;
    private Long quantity;
}