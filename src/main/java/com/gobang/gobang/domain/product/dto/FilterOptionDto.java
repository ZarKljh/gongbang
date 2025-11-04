package com.gobang.gobang.domain.product.dto;

import com.gobang.gobang.domain.product.entity.FilterOption;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilterOptionDto {
    private Long id;
    private String label;
    private String inputType;
    private String selectType;
    private String colorHex;
    private String iconUrl;
    private String tooltip;
    private String filterCode;
    private BigDecimal minValue; // null이면 하한 없음
    private BigDecimal maxValue; // null이면 상한 없음
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;



    public FilterOptionDto(FilterOption filterOption) {
        this.id = filterOption.getId();
        this.label = filterOption.getLabel();
        this.inputType=filterOption.getInputType();
        this.selectType=filterOption.getSelectType();
        this.colorHex=filterOption.getColorHex();
        this.iconUrl=filterOption.getIconUrl();
        this.tooltip=filterOption.getTooltip();
        this.filterCode=filterOption.getFilterCode();
        this.minValue=filterOption.getMinValue();
        this.maxValue=filterOption.getMaxValue();
        this.createdDate = filterOption.getCreatedDate();
        this.modifiedDate = filterOption.getModifiedDate();

    }

}