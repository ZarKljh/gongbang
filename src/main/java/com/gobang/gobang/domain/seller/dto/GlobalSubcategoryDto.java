package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.product.entity.Subcategory;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GlobalSubcategoryDto {
    private Long id;
    private String name;
    private String code;
    private Long categoryId;
    private Integer displayOrder;

    public GlobalSubcategoryDto(Subcategory sc){
        this.id = sc.getId();
        this.name = sc.getName();
        this.code = sc.getCode();
        this.displayOrder = sc.getDisplayOrder();
        this.categoryId = sc.getCategory().getId();
    }
}
