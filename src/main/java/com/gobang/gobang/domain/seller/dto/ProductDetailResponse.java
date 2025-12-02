package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

@Getter
@Builder
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String name;
    private Long categoryId;
    private Long subcategoryId;
    private String categoryName;
    private String subcategoryName;
    private String summary;
    private String description;
    private String slug;
    private String subtitle;
    private Integer basePrice;
    private Integer stockQuantity;
    private Boolean active;
    private String status;
    private Boolean backorderable;
    private String seoTitle;
    private String seoDescription;
    private Image productMainImage;


    public ProductDetailResponse(Product p, Image image, Category category) {
        this.id = p.getId();
        this.name = p.getName();
        this.categoryId = p.getCategoryId();
        this.subcategoryId = p.getSubcategory() != null ? p.getSubcategory().getId() : null;
        this.categoryName = category.getName();
        this.subcategoryName = p.getSubcategory().getName();
        this.basePrice = p.getBasePrice();
        this.stockQuantity = p.getStockQuantity();
        this.active = p.getActive();
        this.summary = p.getSummary();
        this.description = p.getDescription();
        this.slug = p.getSlug();
        this.subtitle = p.getSubtitle();
        this.backorderable = p.getBackorderable();
        this.seoTitle = p.getSeoTitle();
        this.seoDescription = p.getSeoDescription();
        this.status = p.getStatus().name();

        this.productMainImage = image;
    }
}
