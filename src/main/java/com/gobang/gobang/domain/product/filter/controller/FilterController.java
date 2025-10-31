package com.gobang.gobang.domain.product.filter.controller;


import com.gobang.gobang.domain.product.dto.FilterGroupDto;
import com.gobang.gobang.domain.product.dto.FilterOptionDto;
import com.gobang.gobang.domain.product.dto.response.FilterGroupResponse;
import com.gobang.gobang.domain.product.dto.response.FilterOptionResponse;
import com.gobang.gobang.domain.product.filter.service.FilterService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/filter")
public class FilterController {
    private final FilterService filterService;

    @GetMapping("/{categoryId}/group")
    @Operation(summary = "필터 다건 조회 (ID별)")
    public RsData<FilterGroupResponse> filterByCatIdList(@PathVariable Long categoryId, @RequestParam(defaultValue = "5") int size) {
        List<FilterGroupDto> filterGroupList = filterService.getGroupListByCategoryId(categoryId, size);
        return RsData.of("200", "필터 다건 조회 성공", new FilterGroupResponse(filterGroupList));
    }

    @GetMapping("/{groupId}/option")
    @Operation(summary = "필터옵션 다건 조회 (ID별)")
    public RsData<FilterOptionResponse> filterByGroupIdList(@PathVariable Long groupId, @RequestParam(defaultValue = "5") int size) {
        List<FilterOptionDto> filterOptionList = filterService.getOptionListByGroupId(groupId, size);
        return RsData.of("200", "필터옵션 다건 조회 성공", new FilterOptionResponse(filterOptionList));
    }


}
