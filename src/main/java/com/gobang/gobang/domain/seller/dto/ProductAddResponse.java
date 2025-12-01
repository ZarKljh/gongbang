package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductAddResponse {
    private Long id;
    private String name;
    private Long categoryId;
    private Long subcategoryId;
    private Integer basePrice;
    private Integer stockQuantity;
    private Boolean active;

    public ProductAddResponse(Product p) {
        this.id = p.getId();
        this.name = p.getName();
        this.categoryId = p.getCategoryId();
        this.subcategoryId = p.getSubcategory() != null ? p.getSubcategory().getId() : null;
        this.basePrice = p.getBasePrice();
        this.stockQuantity = p.getStockQuantity();
        this.active = p.getActive();
    }
}
