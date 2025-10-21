package com.gobang.gobang.domain.product.category.Controller;

import com.gobang.gobang.domain.product.category.Service.CategoryService;
import com.gobang.gobang.domain.product.dto.CategoryDto;
import com.gobang.gobang.domain.product.dto.response.CategoryResponse;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/category/v1")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("")
    @Operation(summary = "카테고리 다건 조회")
    public RsData<CategoryResponse> categoryList(@RequestParam(defaultValue = "5") int size) {
        List<CategoryDto> categoryList = categoryService.getCategoryList(size);
        return RsData.of("200", "카테고리 다건 조회 성공", new CategoryResponse(categoryList));
    }
}
