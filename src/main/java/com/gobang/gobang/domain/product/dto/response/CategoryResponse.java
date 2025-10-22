package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.CategoryDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CategoryResponse {
    private final List<CategoryDto> categoryList;
}
