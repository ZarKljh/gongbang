package com.gobang.gobang.domain.mypage.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishListResponse {

    private Long wishlistId;
    private SiteUser siteUser;
    private Product product;
    private String productName; // Product 엔티티에서 가져올 예정
    private LocalDateTime createdAt;
}