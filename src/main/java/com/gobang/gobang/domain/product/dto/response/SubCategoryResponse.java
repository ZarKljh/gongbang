package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.SubCategoryDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SubCategoryResponse {
    private final List<SubCategoryDto> subCategoryList;
}
