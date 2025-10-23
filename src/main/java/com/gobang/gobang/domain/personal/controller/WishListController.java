package com.gobang.gobang.domain.personal.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.WishListRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.dto.response.WishListResponse;
import com.gobang.gobang.domain.personal.service.WishListService;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.global.RsData.RsData;
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

    // 찜목록 페이지
    @GetMapping
    public RsData<List<WishListResponse>> wishList(@RequestParam(required = false) SiteUser siteUser) {
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<WishListResponse> wishLists = wishListService.getWishListByUser(siteUser);

        return RsData.of("200", "장바구니 다건 조회 성공", wishLists);
    }

    // 찜 추가
    @PostMapping
    @ResponseBody
    public ResponseEntity<WishListResponse> addWishList(@RequestBody WishListRequest request) {
        WishListResponse response = wishListService.addWishList(request);
        return ResponseEntity.ok(response);
    }

    // 찜 삭제
    @DeleteMapping("/{wishlistId}")
    @ResponseBody
    public ResponseEntity<Void> removeWishList(@PathVariable Long wishlistId) {
        wishListService.removeWishList(wishlistId);
        return ResponseEntity.ok().build();
    }

    // 찜 삭제 - 사용자+상품
    @DeleteMapping
    @ResponseBody
    public ResponseEntity<Void> removeWishListByUserAndProduct(
            @RequestParam SiteUser siteUser,
            @RequestParam Product product) {
        wishListService.removeWishListByUserAndProduct(siteUser, product);
        return ResponseEntity.ok().build();
    }

    // 찜 여부 확인
    @GetMapping("/check")
    @ResponseBody
    public ResponseEntity<Boolean> isWished(
            @RequestParam SiteUser siteUser,
            @RequestParam Product product) {
        boolean isWished = wishListService.isWished(siteUser, product);
        return ResponseEntity.ok(isWished);
    }

    // 상품의 찜 개수 조회
    @GetMapping("/count/product")
    @ResponseBody
    public ResponseEntity<Long> getWishCount(@RequestParam Product product) {
        long count = wishListService.getWishCount(product);
        return ResponseEntity.ok(count);
    }

    // 사용자의 찜 개수 조회
    @GetMapping("/count/user")
    @ResponseBody
    public ResponseEntity<Long> getUserWishCount(@RequestParam SiteUser siteUser) {
        long count = wishListService.getUserWishCount(siteUser);
        return ResponseEntity.ok(count);
    }
}