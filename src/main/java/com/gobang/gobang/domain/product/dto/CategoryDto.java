package com.gobang.gobang.domain.product.dto;

import com.gobang.gobang.domain.product.entity.Category;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String code;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    public CategoryDto(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.code = category.getCode();
        this.createdDate = category.getCreatedDate();
        this.modifiedDate = category.getModifiedDate();
    }

}