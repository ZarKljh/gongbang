package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.product.entity.Category;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalCategoryDto {

    private Long id;
    private String name;
    private String code;
    private Integer displayOrder;

    public GlobalCategoryDto(Category cg){
        this.id = cg.getId();
        this.name = cg.getName();
        this.code = cg.getCode();
        this.displayOrder = cg.getDisplayOrder();
    }
}
