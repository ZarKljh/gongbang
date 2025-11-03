package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.WishListRequest;
import com.gobang.gobang.domain.personal.dto.response.WishListResponse;
import com.gobang.gobang.domain.personal.service.WishListService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/wishlist")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;
    private final SiteUserService siteUserService;

    @GetMapping
    public RsData<List<WishListResponse>> wishList() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        List<WishListResponse> wishLists = wishListService.getWishListByUser(siteUser);
        return RsData.of("200", "위시 다건 조회 성공", wishLists);
    }

    @PostMapping
    public RsData<WishListResponse> addWishList(@RequestBody WishListRequest request) {
        request.setSiteUser(siteUserService.getCurrentUser());
        WishListResponse response = wishListService.addWishList(request);
        return RsData.of("200", "위시 추가 성공", response);
    }

    @DeleteMapping("/{wishlistId}")
    public RsData<Void> removeWishList(@PathVariable Long wishlistId) {
        wishListService.removeWishList(wishlistId);
        return RsData.of("200", "위시 삭제 성공");
    }

    @DeleteMapping
    public RsData<Void> removeWishListByUserAndProduct(@RequestParam Long productId) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        wishListService.removeWishListByUserAndProduct(siteUser, productId);
        return RsData.of("200", "위시 삭제 성공");
    }

    @GetMapping("/check")
    public RsData<Boolean> isWished(@RequestParam Long productId) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        boolean isWished = wishListService.isWished(siteUser, productId);
        return RsData.of("200", "위시 여부 확인 성공", isWished);
    }

    @GetMapping("/count/product")
    public RsData<Long> getWishCount(@RequestParam Long productId) {
        long count = wishListService.getWishCount(productId);
        return RsData.of("200", "상품의 위시 개수 조회 성공", count);
    }

    @GetMapping("/count/user")
    public RsData<Long> getUserWishCount() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        long count = wishListService.getUserWishCount(siteUser);
        return RsData.of("200", "사용자의 위시 개수 조회 성공", count);
    }
}