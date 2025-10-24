package com.gobang.gobang.domain.product.dto;

import com.gobang.gobang.domain.product.entity.FilterGroup;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilterGroupDto {
    private Long id;
    private String name;
    private String code;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private Integer displayOrder;

    public FilterGroupDto(FilterGroup filterGroup) {
        this.id = filterGroup.getId();
        this.name = filterGroup.getName();
        this.code = filterGroup.getCode();
        this.createdDate = filterGroup.getCreatedDate();
        this.modifiedDate = filterGroup.getModifiedDate();
        this.displayOrder = filterGroup.getDisplayOrder();
    }

}