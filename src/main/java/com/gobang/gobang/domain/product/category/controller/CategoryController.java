package com.gobang.gobang.domain.product.category.controller;

import com.gobang.gobang.domain.product.category.service.CategoryService;
import com.gobang.gobang.domain.product.dto.CategoryDto;
import com.gobang.gobang.domain.product.dto.SubCategoryDto;
import com.gobang.gobang.domain.product.dto.response.CategoryResponse;
import com.gobang.gobang.domain.product.dto.response.SubCategoryResponse;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/category")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("")
    @Operation(summary = "카테고리 다건 조회")
    public RsData<CategoryResponse> categoryList(@RequestParam(defaultValue = "10") int size) {
        List<CategoryDto> categoryList = categoryService.getCategoryList(size);
        return RsData.of("200", "카테고리 다건 조회 성공", new CategoryResponse(categoryList));
    }

    @GetMapping("/sub")
    @Operation(summary = "서브 카테고리 다건 조회")
    public RsData<SubCategoryResponse> subCategoryList(@RequestParam(defaultValue = "30") int size) {
        List<SubCategoryDto> subcategoryList = categoryService.getSubCategoryList(size);
        return RsData.of("200", "카테고리 다건 조회 성공", new SubCategoryResponse(subcategoryList));
    }

    @GetMapping("/{categoryId}/sub")
    @Operation(summary = "서브 카테고리 다건 조회 (ID별)")
    public RsData<SubCategoryResponse> subCategoryIdList(@PathVariable Long categoryId, @RequestParam(defaultValue = "5") int size) {
        List<SubCategoryDto> subcategoryList = categoryService.getSubCategoryIdList(categoryId, size);
        return RsData.of("200", "카테고리 다건 조회 성공", new SubCategoryResponse(subcategoryList));
    }
}
