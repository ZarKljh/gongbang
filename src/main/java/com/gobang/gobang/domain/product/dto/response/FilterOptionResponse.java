package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.FilterOptionDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class FilterOptionResponse {
    private final List<FilterOptionDto> filterOptionList;
}
