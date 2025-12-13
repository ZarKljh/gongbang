package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.CartDeleteRequest;
import com.gobang.gobang.domain.personal.dto.request.CartOrderRequest;
import com.gobang.gobang.domain.personal.dto.request.CartRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.personal.service.CartService;
import com.gobang.gobang.domain.personal.service.OrdersService;
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
    private final OrdersService orderService;

    @GetMapping
    public RsData<List<CartResponse>> cartList() {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "장바구니 다건 조회 성공",
                cartService.getCartsByUserId(user));
    }

    @PostMapping
    public RsData<CartResponse> addToCart(@RequestBody CartRequest request) {
        SiteUser user = siteUserService.getCurrentUser();
        request.setSiteUser(user);
        return RsData.of("200", "장바구니 담기 성공",
                cartService.addToCart(request));
    }

    @PatchMapping("/{cartId}")
    public RsData<CartResponse> updateCartQuantity(
            @PathVariable Long cartId,
            @RequestParam Long quantity
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "수량 수정 성공",
                cartService.updateCartQuantity(cartId, quantity, user));
    }

    @DeleteMapping("/{cartId}")
    public RsData<Void> deleteCart(@PathVariable Long cartId) {
        SiteUser user = siteUserService.getCurrentUser();
        cartService.deleteCart(cartId, user);
        return RsData.of("200", "삭제 성공");
    }

    @DeleteMapping("/clear")
    public RsData<Void> clearCart() {
        SiteUser user = siteUserService.getCurrentUser();
        cartService.clearCart(user);
        return RsData.of("200", "전체 삭제 성공");
    }

    @GetMapping("/count")
    public RsData<Long> getCartCount() {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "장바구니 개수 조회 성공",
                cartService.getCartCount(user));
    }

    @PostMapping("/prepare")
    public RsData<PrepareOrderResponse> prepareCartOrder(
            @RequestBody CartOrderRequest request
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "장바구니 주문 준비 성공",
                orderService.prepareCartOrder(
                        user,
                        request.getItems(),
                        request.getAddressId()
                ));
    }

    @DeleteMapping("/after-order")
    public RsData<Void> deletePurchasedItems(@RequestBody CartDeleteRequest request) {
        SiteUser user = siteUserService.getCurrentUser();
        cartService.deletePurchasedItems(user, request.getCartIds());
        return RsData.of("200", "구매한 상품 장바구니 삭제 완료");
    }
}