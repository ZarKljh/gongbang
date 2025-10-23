package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.CartRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.entity.Cart;
import com.gobang.gobang.domain.personal.service.CartService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/mypage/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // 장바구니 목록 페이지
    @GetMapping
    @Operation(summary = "장바구니 다건 조회")
    public RsData<List<CartResponse>> cartList(@RequestParam(required = false) SiteUser siteUser) {
        if (siteUser == null) {
            return RsData.of("400", "유저 정보가 없습니다.");
        }

        List<CartResponse> cartList = cartService.getCartsByUserId(siteUser);

        return RsData.of("200", "장바구니 다건 조회 성공", cartList);
    }

    // 장바구니 담기
    @PostMapping
    @Operation(summary = "장바구니 담기")
    public RsData<CartResponse> addToCart(@Valid @RequestBody CartRequest request) {
        CartResponse response = cartService.addToCart(request);
        return RsData.of("200", "장바구니 담기 성공", response);
    }

    // 장바구니 수량 수정
    @PatchMapping("/{cartId}")
    @ResponseBody
    @Operation(summary = "장바구니 수량 수정")
    public RsData<CartResponse> updateCartQuantity(
            @PathVariable Long cartId,
            @RequestParam Long quantity) {
        CartResponse response = cartService.updateCartQuantity(cartId, quantity);
        return RsData.of("200", "수정성공", response);
    }

    // 장바구니 항목 삭제
    @DeleteMapping("/{cartId}")
    @ResponseBody
    @Operation(summary = "장바구니 항목 삭제")
    public RsData<Cart> deleteCart(@PathVariable Long cartId) {
        Cart cart = cartService.getCartByCartId(cartId);
        cartService.deleteCart(cartId);
        return RsData.of("200", "삭제성공", cart);
    }

    // 장바구니 전체 삭제
    @DeleteMapping("/clear")
    @ResponseBody
    @Operation(summary = "장바구니 전체 삭제")
    public RsData<String> clearCart(SiteUser siteUser) {
        cartService.clearCart(siteUser);
        return RsData.of("200", "전체삭제 성공");
    }

    // 장바구니 개수 조회
    @GetMapping("/count")
    @ResponseBody
    @Operation(summary = "장바구니 개수 조회")
    public RsData<Long> getCartCount(SiteUser siteUser) {
        long count = cartService.getCartCount(siteUser);
        return RsData.of("200", "장바구니 개수 조회 성공", count);
    }
}