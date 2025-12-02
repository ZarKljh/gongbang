package com.gobang.gobang.domain.product.home.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopStudioResponse {

    private Long studioId;
    private String studioName;
    private String mainImageUrl;
    private Integer followerCount;

    private List<ProductDto> recentProducts;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDto {
        private Long productId;
        private String productName;
        private String summary;
        private String imageUrl;
        private int price;
    }
}