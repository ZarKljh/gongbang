package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.CartRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.service.CartService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final SiteUserService siteUserService;

    @GetMapping
    public RsData<List<CartResponse>> cartList() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        List<CartResponse> cartList = cartService.getCartsByUserId(siteUser);
        return RsData.of("200", "장바구니 다건 조회 성공", cartList);
    }

    @PostMapping
    public RsData<CartResponse> addToCart(@RequestBody CartRequest request) {
        request.setSiteUser(siteUserService.getCurrentUser());
        CartResponse response = cartService.addToCart(request);
        return RsData.of("200", "장바구니 담기 성공", response);
    }

    @PatchMapping("/{cartId}")
    public RsData<CartResponse> updateCartQuantity(@PathVariable Long cartId, @RequestParam Long quantity) {
        CartResponse response = cartService.updateCartQuantity(cartId, quantity);
        return RsData.of("200", "수량 수정 성공", response);
    }

    @DeleteMapping("/{cartId}")
    public RsData<Void> deleteCart(@PathVariable Long cartId) {
        cartService.deleteCart(cartId);
        return RsData.of("200", "삭제 성공");
    }

    @DeleteMapping("/clear")
    public RsData<Void> clearCart() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        cartService.clearCart(siteUser);
        return RsData.of("200", "전체 삭제 성공");
    }

    @GetMapping("/count")
    public RsData<Long> getCartCount() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        long count = cartService.getCartCount(siteUser);
        return RsData.of("200", "장바구니 개수 조회 성공", count);
    }
}