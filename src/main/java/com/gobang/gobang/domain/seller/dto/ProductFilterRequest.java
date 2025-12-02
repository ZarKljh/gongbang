package com.gobang.gobang.domain.seller.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductFilterRequest {
    private String keyword;        // 상품명 검색
    private Long categoryId;       // categoryName
    private Long subcategoryId;    // subcategoryName

    private Integer priceMin;
    private Integer priceMax;

    private List<String> active;   // ["on","off"]
    private List<String> stock;    // ["in","out"]
    private List<String> status;   // ["SALE","STOP",...]

    public ProductFilterRequest(
        String keyword,
        Long categoryId,
        Long subcategoryId,
        Integer priceMin,
        Integer priceMax,
        List<String> active,
        List<String> stock,
        List<String> status
    ) {
        this.keyword = keyword;
        this.categoryId = categoryId;
        this.subcategoryId = subcategoryId;
        this.priceMin = priceMin;
        this.priceMax = priceMax;
        this.active = active;
        this.stock = stock;
        this.status = status;
    }

    public ProductFilterRequest() {}
}
