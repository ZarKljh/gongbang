package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.product.dto.ProductDto;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductListOfStudioResponse {

    private ProductDto product;     // ProductDto 자체 포함
    private String categoryName;
    private String subcategoryName;

    public static ProductListOfStudioResponse from(
            ProductDto dto,
            String categoryName,
            String subcategoryName
    ) {
        return ProductListOfStudioResponse.builder()
                .product(dto)
                .categoryName(categoryName)
                .subcategoryName(subcategoryName)
                .build();
    }
}