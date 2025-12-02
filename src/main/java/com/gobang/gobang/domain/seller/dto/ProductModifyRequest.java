package com.gobang.gobang.domain.seller.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductModifyRequest {
    private Long productId;
    private Long studioId;
    private String name;
    private String slug;
    private Long categoryId;
    private Long subcategoryId;
    private String subtitle;
    private Integer basePrice;
    private Integer stockQuantity;
    private Boolean backorderable;
    private Boolean active;
    private String status;
    private String summary;
    private String description;
    private String seoTitle;
    private String seoDescription;

    private String productMainImageName;

}
