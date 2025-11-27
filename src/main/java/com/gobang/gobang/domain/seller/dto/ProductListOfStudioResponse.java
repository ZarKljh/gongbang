package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.product.dto.ProductDto;
import lombok.*;


@Data
public class ProductListOfStudioResponse extends ProductDto {

    private String categoryName;       // 확장 필드
    private String subcategoryName;    // 확장 필드

    /**
     * ProductDto 엔티티 기반으로 생성 + 확장 필드 추가
     */
    public static ProductListOfStudioResponse from(ProductDto dto, String categoryName, String subcategoryName) {
        ProductListOfStudioResponse res = new ProductListOfStudioResponse();

        // 부모(ProductDto)의 필드를 그대로 복사
        res.setId(dto.getId());
        //res.setStudioId(dto.getStudioId());
        res.setThemeId(dto.getThemeId());
        res.setCategoryId(dto.getCategoryId());
        res.setName(dto.getName());
        res.setSummary(dto.getSummary());
        res.setDescription(dto.getDescription());
        res.setSlug(dto.getSlug());
        res.setSubtitle(dto.getSubtitle());
        res.setBasePrice(dto.getBasePrice());
        res.setStockQuantity(dto.getStockQuantity());
        //res.setBackorderable(dto.getBackorderable());
        res.setStatus(dto.getStatus());
        res.setActive(dto.getActive());
        //res.setCreatedAt(dto.getCreatedAt());
        //res.setUpdatedAt(dto.getUpdatedAt());

        // 확장 필드
        res.setCategoryName(categoryName);
        res.setSubcategoryName(subcategoryName);

        return res;
    }
}
