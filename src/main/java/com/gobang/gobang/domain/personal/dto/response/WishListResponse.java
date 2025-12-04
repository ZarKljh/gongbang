package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.entity.WishList;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class WishListResponse {

    private Long wishlistId;
    private Long userId;
    private Long productId;
    private String productName;
    private Integer price;
    private LocalDateTime createdAt;
    private String imageUrl;

    public static WishListResponse from(WishList wishList, ImageRepository imageRepository) {
        String imageUrl = imageRepository
                .findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.PRODUCT, wishList.getProduct().getId())
                .stream()
                .findFirst()
                .map(img -> "/images/products/" + img.getImageFileName())
                .orElse(null);

        return WishListResponse.builder()
                .wishlistId(wishList.getWishlistId())
                .userId(wishList.getSiteUser().getId())
                .productId(wishList.getProduct().getId())
                .productName(wishList.getProduct().getName())
                .price(wishList.getProduct().getBasePrice())
                .createdAt(wishList.getCreatedAt())
                .imageUrl(imageUrl)
                .build();
    }
}