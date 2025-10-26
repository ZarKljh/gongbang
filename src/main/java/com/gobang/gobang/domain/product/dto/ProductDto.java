package com.gobang.gobang.domain.product.dto;

import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String subtitle;
    private String summary;
    private String description;

    private Integer basePrice;
    private Integer stockQuantity;

    private String slug;
    private ProductStatus status;
    private Boolean active;

    private Long categoryId;
    private Long subcategoryId;
    private Long themeId;

    private String seoTitle;
    private String seoDescription;

    //private String thumbnailUrl; // 썸네일 이미지 경로 (확장 필드) 여기서 안할거임.. 이미지 테이블 만들면 그쪽 dto에서 수정해봄

    public static ProductDto fromEntity(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .subtitle(product.getSubtitle())
                .summary(product.getSummary())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .stockQuantity(product.getStockQuantity())
                .slug(product.getSlug())
                .status(product.getStatus())
                .active(product.getActive())
                .categoryId(product.getCategoryId())
                .themeId(product.getThemeId())
                .seoTitle(product.getSeoTitle())
                .seoDescription(product.getSeoDescription())
                .subcategoryId(
                        product.getSubcategory() != null ? product.getSubcategory().getId() : null
                )
                .build();
    }

}