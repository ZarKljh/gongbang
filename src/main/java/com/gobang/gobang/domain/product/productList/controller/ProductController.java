package com.gobang.gobang.domain.product.productList.controller;

import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.dto.response.ProductResponse;
import com.gobang.gobang.domain.product.productList.service.ProductService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/product")
public class ProductController {
    private final ProductService productService;

    @GetMapping("/{subCategoryId}")
    @Operation(summary = "상품 다건 조회")
    public RsData<ProductResponse> categoryList(@PathVariable Long subCategoryId, @RequestParam(defaultValue = "6") int size) {
        List<ProductDto> productList = productService.getProductList(subCategoryId, size);
        return RsData.of("200", "상품 다건 조회 성공", new ProductResponse(productList));
    }

    @GetMapping("/{subCategoryId}/search")
    @Operation(summary = "상품 다건 필터 조회")
    public RsData<ProductResponse> categoryFilterList(@PathVariable Long subCategoryId, @RequestParam(defaultValue = "6") int size, @RequestParam MultiValueMap<String, String> params) {
        // 단일값
//        String RADIOGroup = params.getFirst("RADIOGroup");
//        String CHECKBOXGroup = params.getFirst("CHECKBOXGroup");
//        System.out.printf("✅ RADIOGroup : %s%n", RADIOGroup);
//        System.out.printf("✅ CHECKBOXGroup : %s%n", CHECKBOXGroup);


        System.out.println("===== 📦 받은 필터 파라미터 =====");
        params.forEach((key, values) -> {
            System.out.println(key + " = " + values);
        });
        System.out.println("================================");


        List<ProductDto> productList = productService.getProductList(subCategoryId, size);
        return RsData.of("200", "상품 다건 조회 성공", new ProductResponse(productList));
    }


}
