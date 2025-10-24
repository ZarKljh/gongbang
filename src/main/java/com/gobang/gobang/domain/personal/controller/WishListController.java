package com.gobang.gobang.domain.personal.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.WishListRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.dto.response.WishListResponse;
import com.gobang.gobang.domain.personal.service.WishListService;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/mypage/wishlist")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;

    // 위시리스트 페이지
    @GetMapping
    @Operation(summary = "위시리스트")
    public RsData<List<WishListResponse>> wishList(@RequestParam(required = false) SiteUser siteUser) {
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<WishListResponse> wishLists = wishListService.getWishListByUser(siteUser);

        return RsData.of("200", "위시 다건 조회 성공", wishLists);
    }

    // 위시 추가
    @PostMapping
    @ResponseBody
    @Operation(summary = "위시 추가")
    public RsData<WishListResponse> addWishList(@RequestBody WishListRequest request) {
        WishListResponse response = wishListService.addWishList(request);
        return RsData.of("200", "위시 추가 성공", response);
    }

    // 위시 삭제
    @DeleteMapping("/{wishlistId}")
    @ResponseBody
    @Operation(summary = "위시 삭제")
    public RsData<Void> removeWishList(@PathVariable Long wishlistId) {
        wishListService.removeWishList(wishlistId);
        return RsData.of("200", "위시 삭제 성공");
    }

    // 위시 삭제 - 사용자+상품
    @DeleteMapping
    @ResponseBody
    @Operation(summary = "위시 삭제")
    public RsData<Void> removeWishListByUserAndProduct(@RequestParam SiteUser siteUser, @RequestParam Product product) {
        wishListService.removeWishListByUserAndProduct(siteUser, product);
        return RsData.of("200", "위시 삭제 성공");
    }

    // 위시 여부 확인
    @GetMapping("/check")
    @ResponseBody
    @Operation(summary = "위시 여부 확인")
    public RsData<Boolean> isWished(@RequestParam SiteUser siteUser, @RequestParam Product product) {
        boolean isWished = wishListService.isWished(siteUser, product);
        return RsData.of("200", "위시 여부 확인 성공", isWished);
    }

    // 상품의 위시 개수 조회
    @GetMapping("/count/product")
    @ResponseBody
    @Operation(summary = "상품의 위시 개수 조회")
    public RsData<Long> getWishCount(@RequestParam Product product) {
        long count = wishListService.getWishCount(product);
        return RsData.of("200", "상품의 위시 개수 조회 성공", count);
    }

    // 사용자의 위시 개수 조회
    @GetMapping("/count/user")
    @ResponseBody
    @Operation(summary = "사용자의 위시 개수 조회")
    public RsData<Long> getUserWishCount(@RequestParam SiteUser siteUser) {
        long count = wishListService.getUserWishCount(siteUser);
        return RsData.of("200", "사용자의 위시 개수 조회 성공", count);
    }
}