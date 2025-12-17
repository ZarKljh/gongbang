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
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "위시 다건 조회 성공",
                wishListService.getWishListByUser(user));
    }

    @PostMapping
    public RsData<WishListResponse> addWishList(@RequestBody WishListRequest request) {
        SiteUser user = siteUserService.getCurrentUser();
        request.setSiteUser(user);
        return RsData.of("200", "위시 추가 성공",
                wishListService.addWishList(request));
    }

    @DeleteMapping("/{wishlistId}")
    public RsData<Void> removeWishList(@PathVariable Long wishlistId) {
        SiteUser user = siteUserService.getCurrentUser();
        wishListService.removeWishList(wishlistId, user);
        return RsData.of("200", "위시 삭제 성공");
    }

    @GetMapping("/check")
    public RsData<Boolean> isWished(@RequestParam Long productId) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "위시 여부 확인 성공",
                wishListService.isWished(user, productId));
    }

    @GetMapping("/count/user")
    public RsData<Long> getUserWishCount() {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "사용자의 위시 개수 조회 성공",
                wishListService.getUserWishCount(user));
    }

    @GetMapping("/infinite")
    public RsData<List<WishListResponse>> getInfiniteWishlist(
            @RequestParam(required = false) Long lastWishId,
            @RequestParam(defaultValue = "10") int size
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "위시리스트 무한스크롤 조회 성공",
                wishListService.getInfiniteWishlist(user, lastWishId, size));
    }
}