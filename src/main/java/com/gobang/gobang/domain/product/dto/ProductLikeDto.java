package com.gobang.gobang.domain.product.dto;

import com.gobang.gobang.domain.personal.entity.WishList;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductLikeDto {
    private Long id;            // 위시리스트 PK
    private Long productId;     // 찜한 상품 ID
    private Long userId;        // 회원 ID
    private LocalDateTime createdAt;


    public ProductLikeDto(WishList wishList) {
        this.id = wishList.getWishlistId();
        this.productId = wishList.getProduct().getId();
        this.userId = wishList.getSiteUser().getId();
        this.createdAt = wishList.getCreatedAt();

    }
}