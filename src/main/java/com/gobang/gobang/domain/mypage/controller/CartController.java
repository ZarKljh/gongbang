package com.gobang.gobang.domain.mypage.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.mypage.dto.request.CartRequest;
import com.gobang.gobang.domain.mypage.dto.response.CartResponse;
import com.gobang.gobang.domain.mypage.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/mypage/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // 장바구니 목록 페이지
    @GetMapping
    public String cartList(@RequestParam(required = false) SiteUser siteUser, Model model) {
        // TODO: 실제로는 세션에서 userId를 가져와야 함
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<CartResponse> carts = cartService.getCartsByUserId(siteUser);
        long cartCount = cartService.getCartCount(siteUser);

        model.addAttribute("carts", carts);
        model.addAttribute("cartCount", cartCount);
        model.addAttribute("siteUser", siteUser);

        return "mypage/cart";
    }

    // 장바구니 담기 (AJAX)
    @PostMapping
    @ResponseBody
    public ResponseEntity<CartResponse> addToCart(@RequestBody CartRequest request) {
        CartResponse response = cartService.addToCart(request);
        return ResponseEntity.ok(response);
    }

    // 장바구니 수량 수정 (AJAX)
    @PatchMapping("/{cartId}")
    @ResponseBody
    public ResponseEntity<CartResponse> updateCartQuantity(
            @PathVariable Long cartId,
            @RequestParam Long quantity) {
        CartResponse response = cartService.updateCartQuantity(cartId, quantity);
        return ResponseEntity.ok(response);
    }

    // 장바구니 항목 삭제 (AJAX)
    @DeleteMapping("/{cartId}")
    @ResponseBody
    public ResponseEntity<Void> deleteCart(@PathVariable Long cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.ok().build();
    }

    // 장바구니 전체 삭제 (AJAX)
    @DeleteMapping("/clear")
    @ResponseBody
    public ResponseEntity<Void> clearCart(@RequestParam SiteUser siteUser) {
        cartService.clearCart(siteUser);
        return ResponseEntity.ok().build();
    }

    // 장바구니 개수 조회 (AJAX)
    @GetMapping("/count")
    @ResponseBody
    public ResponseEntity<Long> getCartCount(@RequestParam SiteUser siteUser) {
        long count = cartService.getCartCount(siteUser);
        return ResponseEntity.ok(count);
    }
}