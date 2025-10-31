package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class WishListResponse {

    private Long wishlistId;
    private SiteUser siteUser;
    private Product product;
    private String productName; // Product 엔티티에서 가져올 예정
    private LocalDateTime createdAt;

    public static WishListResponse from(WishList wishList) {
        return WishListResponse.builder()
                .wishlistId(wishList.getWishlistId())
                .siteUser(wishList.getSiteUser())
                .product(wishList.getProduct())
                .createdAt(wishList.getCreatedAt())
                .build();
    }
}