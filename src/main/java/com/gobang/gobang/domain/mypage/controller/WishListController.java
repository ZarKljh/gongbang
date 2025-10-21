package com.gobang.gobang.domain.mypage.controller;


import com.gobang.gobang.domain.mypage.dto.request.WishListRequest;
import com.gobang.gobang.domain.mypage.dto.response.WishListResponse;
import com.gobang.gobang.domain.mypage.service.WishListService;
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
    public String wishList(@RequestParam(required = false) Long userId, Model model) {
        // TODO: 실제로는 세션에서 userId를 가져와야 함
        if (userId == null) {
            userId = 1L; // 테스트용 기본값
        }

        List<WishListResponse> wishLists = wishListService.getWishListByUserId(userId);
        long wishCount = wishListService.getUserWishCount(userId);

        model.addAttribute("wishLists", wishLists);
        model.addAttribute("wishCount", wishCount);
        model.addAttribute("userId", userId);

        return "mypage/wishlist";
    }

    // 찜 추가 (AJAX)
    @PostMapping
    @ResponseBody
    public ResponseEntity<WishListResponse> addWishList(@RequestBody WishListRequest request) {
        WishListResponse response = wishListService.addWishList(request);
        return ResponseEntity.ok(response);
    }

    // 찜 삭제 (AJAX)
    @DeleteMapping("/{wishlistId}")
    @ResponseBody
    public ResponseEntity<Void> removeWishList(@PathVariable Long wishlistId) {
        wishListService.removeWishList(wishlistId);
        return ResponseEntity.ok().build();
    }

    // 찜 삭제 - 사용자+상품 (AJAX)
    @DeleteMapping
    @ResponseBody
    public ResponseEntity<Void> removeWishListByUserAndProduct(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        wishListService.removeWishListByUserAndProduct(userId, productId);
        return ResponseEntity.ok().build();
    }

    // 찜 여부 확인 (AJAX)
    @GetMapping("/check")
    @ResponseBody
    public ResponseEntity<Boolean> isWished(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        boolean isWished = wishListService.isWished(userId, productId);
        return ResponseEntity.ok(isWished);
    }

    // 상품의 찜 개수 조회 (AJAX)
    @GetMapping("/count/product")
    @ResponseBody
    public ResponseEntity<Long> getWishCount(@RequestParam Long productId) {
        long count = wishListService.getWishCount(productId);
        return ResponseEntity.ok(count);
    }

    // 사용자의 찜 개수 조회 (AJAX)
    @GetMapping("/count/user")
    @ResponseBody
    public ResponseEntity<Long> getUserWishCount(@RequestParam Long userId) {
        long count = wishListService.getUserWishCount(userId);
        return ResponseEntity.ok(count);
    }
}