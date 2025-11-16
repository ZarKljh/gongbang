package com.gobang.gobang.domain.product.productList.controller;

import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.response.SiteUserResponse;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.dto.response.FilterProductResponse;
import com.gobang.gobang.domain.product.dto.response.ProductDetailResponse;
import com.gobang.gobang.domain.product.dto.response.ProductLikeResponse;
import com.gobang.gobang.domain.product.dto.response.ProductResponse;
import com.gobang.gobang.domain.product.productList.service.ProductService;
import com.gobang.gobang.domain.product.productList.service.ProductWishListService;
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
    private final ProductWishListService productWishListService;
    private final SiteUserService siteUserService;

    @GetMapping("/{subCategoryId}")
    @Operation(summary = "상품 다건 조회")
    public RsData<ProductResponse> categoryList(@PathVariable Long subCategoryId, @RequestParam(defaultValue = "20") int size) {
        List<ProductDto> productList = productService.getProductList(subCategoryId, size);
        return RsData.of("200", "상품 다건 조회 성공", new ProductResponse(productList));
    }

    @GetMapping("/{subCategoryId}/search")
    @Operation(summary = "상품 다건 필터 조회")
    public RsData<FilterProductResponse> categoryFilterList(@PathVariable Long subCategoryId, @RequestParam(defaultValue = "20") int size, @RequestParam MultiValueMap<String, String> params) {

        System.out.println("===== 📦 받은 필터 파라미터 =====");
        params.forEach((key, values) -> {
            System.out.println(key + " = " + values);
        });
        System.out.println("================================");



        SiteUserResponse currentUser = null;
        try {
            currentUser = siteUserService.getCurrentUserInfo(); // 로그인 안 되어 있으면 null 리턴 or 예외
        } catch (RuntimeException e) {
            // 인증 예외만 골라서 잡아도 됨 (ex. CustomAuthException)
            currentUser = null; // 비로그인 상태로 처리
        }


        FilterProductResponse result = productService.getProductFilterList(subCategoryId, size, params, currentUser);
        return RsData.of("200", "상품 다건 조회 성공", result);
    }



    @GetMapping("/{productId}/detail")
    @Operation(summary = "상품 상세 조회")
    public RsData<ProductDetailResponse> DetailList(@PathVariable Long productId) {
        ProductDto productDetailList = productService.getProductDetail(productId);
        return RsData.of("200", "상품 다건 조회 성공", new ProductDetailResponse(productDetailList));
    }



    @PostMapping("/{productId}/like")
    @Operation(summary = "상품 좋아요")
    public RsData<ProductLikeResponse> toggleLike(
            @PathVariable Long productId
    ) {
        // 🔒 현재 로그인 유저 조회
        SiteUserResponse currentUser = siteUserService.getCurrentUserInfo();

        // 비로그인 상태 처리
        if (currentUser == null) {
            return RsData.of("401", "로그인 후 이용할 수 있습니다."); // data 없음
        }

        // ✅ 좋아요 토글 서비스 호출
        ProductLikeResponse res = productWishListService.toggleLike(productId, currentUser.getId());

        // ✅ 최종 응답 반환 (RsData 래핑)
        String msg = res.isLiked() ? "상품을 찜했습니다." : "찜을 취소했습니다.";

        return RsData.of("200", msg, res);
    }

}
