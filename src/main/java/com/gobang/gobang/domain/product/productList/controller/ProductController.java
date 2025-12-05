package com.gobang.gobang.domain.product.productList.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.repository.UserAddressRepository;
import com.gobang.gobang.domain.product.dto.HotProductDto;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.dto.request.ProductCartRequest;
import com.gobang.gobang.domain.product.dto.response.*;
import com.gobang.gobang.domain.product.productList.service.ProductCartService;
import com.gobang.gobang.domain.product.productList.service.ProductService;
import com.gobang.gobang.domain.product.productList.service.ProductWishListService;
import com.gobang.gobang.domain.seller.service.SellerFollowService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.config.SecurityUser;
import com.gobang.gobang.global.exception.CustomException;
import com.gobang.gobang.global.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final SellerFollowService sellerFollowService;
    private final ProductCartService productCartService;
    private final SiteUserRepository siteUserRepository;
    private final UserAddressRepository userAddressRepository;

    @GetMapping("/{subCategoryId}")
    @Operation(summary = "상품 다건 조회")
    public RsData<ProductResponse> categoryList(@PathVariable Long subCategoryId, @RequestParam(defaultValue = "20") int size) {
        List<ProductDto> productList = productService.getProductList(subCategoryId, size);
        return RsData.of("200", "상품 다건 조회 성공", new ProductResponse(productList));
    }

    @GetMapping("/{subCategoryId}/search")
    @Operation(summary = "목록페이지 상품 다건 필터 조회")
    public RsData<FilterProductResponse> categoryFilterList(@PathVariable Long subCategoryId, @RequestParam(defaultValue = "20") int size, @RequestParam MultiValueMap<String, String> params,
                                                            @AuthenticationPrincipal SecurityUser user) {

        System.out.println("===== 📦 받은 필터 파라미터 =====");
        params.forEach((key, values) -> {
            System.out.println(key + " = " + values);
        });
        System.out.println("================================");





        FilterProductResponse result = productService.getProductFilterList(subCategoryId, size, params, user);
        return RsData.of("200", "상품 다건 조회 성공", result);
    }


    @GetMapping("/{productId}/detail")
    @Operation(summary = "상품 상세 조회 (상세+이미지+셀러+팔로우 상세)")
    public RsData<ProductDetailResponse> DetailList(@PathVariable Long productId,
    @AuthenticationPrincipal SecurityUser user
    ) {

        // 로그인되어 있으면 userId 전달, 아니면 null
        Long userId = (user != null ? user.getId() : null);

        ProductDetailResponse productDetailList = productService.getProductDetail(productId, userId);
        return RsData.of("200", "상품 다건 조회 성공", productDetailList);
    }


    @PostMapping("/{productId}/like")
    @Operation(summary = "(목록+상세) 페이지 상품 좋아요")
    public RsData<ProductLikeResponse> toggleLike(
            @PathVariable Long productId,
            @AuthenticationPrincipal SecurityUser user
    ) {
        if (user == null) {
            throw new CustomException(ErrorCode.LOGIN_INPUT_INVALID);
        }


        // ✅ 좋아요 토글 서비스 호출
        ProductLikeResponse res = productWishListService.toggleLike(productId, user.getId());

        // ✅ 최종 응답 반환 (RsData 래핑)
        String msg = res.isLiked() ? "상품을 찜했습니다." : "찜을 취소했습니다.";

        return RsData.of("200", msg, res);
    }


    @PostMapping("/{studioId}/follow")
    @Operation(summary = "상세페이지 셀러 팔로우")
    public RsData<SellerFollowResponse> toggleFollow(
            @PathVariable Long studioId,
            @AuthenticationPrincipal SecurityUser user

    ) {
        if (user == null) {
            throw new CustomException(ErrorCode.LOGIN_INPUT_INVALID);
        }

        SellerFollowResponse res = sellerFollowService.toggleFollow(studioId, user.getId());

        // ✅ 최종 응답 반환 (RsData 래핑)
        String msg = res.isFollowed() ? "작가 팔로우." : "작가 팔로우 취소.";

        return RsData.of("200", msg, res);
    }


    @PostMapping("/{productId}/cart")
    @Operation(summary = "상세페이지 상품 장바구니")
    public RsData<ProductCartResponse> toggleCart(
            @PathVariable Long productId,
            @RequestBody ProductCartRequest request,
            @AuthenticationPrincipal SecurityUser user
    ) {
        if (user == null) {
            throw new CustomException(ErrorCode.LOGIN_INPUT_INVALID);
        }

        ProductCartResponse res = productCartService.addToCart(productId, user.getId(), request);

        // ✅ 최종 응답 반환 (RsData 래핑)


        return RsData.of("200", "장바구니 성공.", res);
    }

    @GetMapping("/hot/likes")
    @Operation(summary = "최근 N일간 좋아요 많이 받은 상품")
    public RsData<List<HotProductDto>> getHotProducts(
            @RequestParam(defaultValue = "3") int days,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<HotProductDto> result =
                productService.getHotProductsInLastDays(days, size);

        return RsData.of("200", "최근 " + days + "일간 인기 상품 조회 성공", result);
    }

    //로그인 확인용으로만 일단 구현함
    @PostMapping("/buyBtn")
    public ResponseEntity<PrepareOrderResponse> BuyBtn(
            @AuthenticationPrincipal SecurityUser user //  프로젝트에 맞게 타입 수정
    ) {
        if (user == null) {
            // 방법 1: 예외 던지기
            //throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
            throw new CustomException(ErrorCode.LOGIN_INPUT_INVALID);
        }

        // 2) SecurityUser → SiteUser 조회
        SiteUser siteUser = siteUserRepository.findById(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.ENTITY_NOT_FOUND));
        // 🔹 getId 대신 getUserId() 쓴다면 프로젝트에 맞게 수정

        // 3) 기본 배송지 존재 여부 확인
        boolean hasDefaultAddress =
                userAddressRepository.existsBySiteUserAndIsDefaultTrue(siteUser);

        if (!hasDefaultAddress) {
            throw new CustomException(ErrorCode.NO_DEFAULT_ADDRESS);
        }

        // 4) 여기까지 왔으면: 로그인 O + 기본 배송지 O
        //    일단 "OK"만 알려주면 되니까 바디 없이 200으로 응답
        return ResponseEntity.ok().build();
    }

}
