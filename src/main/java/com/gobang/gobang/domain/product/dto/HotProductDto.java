package com.gobang.gobang.domain.product.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotProductDto {
    private Long productId;
    private String productName;
    private String thumbnailUrl;
    private Long recentLikes;
    private Long basePrice;

}