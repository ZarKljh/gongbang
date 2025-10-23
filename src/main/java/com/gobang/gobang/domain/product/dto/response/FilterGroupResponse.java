package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.FilterGroupDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class FilterGroupResponse {
    private final List<FilterGroupDto> FilterGroupList;
}
