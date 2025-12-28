package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.dto.ProductDto;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductListOfStudioPageResponse {
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

    // 이미지 객체 혹은 이미지 URL (프론트엔드 편의를 위해 URL 문자열을 추천하지만,
    // 기존 구조 유지를 위해 Image 객체로 둡니다.)
    private Image productImage;

    /**
     * ✅ ProductDto와 Image를 결합하여 Response를 만드는 정적 팩토리 메서드
     */
    public static ProductListOfStudioPageResponse of(ProductDto productDto, Image productImage) {
        return ProductListOfStudioPageResponse.builder()
                .id(productDto.getId())
                .name(productDto.getName())
                .subtitle(productDto.getSubtitle())
                .summary(productDto.getSummary())
                .description(productDto.getDescription())
                .basePrice(productDto.getBasePrice())
                .stockQuantity(productDto.getStockQuantity())
                .slug(productDto.getSlug())
                .status(productDto.getStatus())
                .active(productDto.getActive())
                .categoryId(productDto.getCategoryId())
                .subcategoryId(productDto.getSubcategoryId())
                .themeId(productDto.getThemeId())
                .seoTitle(productDto.getSeoTitle())
                .seoDescription(productDto.getSeoDescription())
                .productImage(productImage)
                .build();
    }
}