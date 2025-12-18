package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.CartOrderRequest;
import com.gobang.gobang.domain.personal.dto.request.PaymentConfirmRequest;
import com.gobang.gobang.domain.personal.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.personal.service.CartService;
import com.gobang.gobang.domain.personal.service.OrdersService;
import com.gobang.gobang.domain.personal.service.PaymentService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments/cart")
@RequiredArgsConstructor
public class CartPaymentController {

    private final SiteUserService siteUserService;
    private final OrdersService ordersService;
    private final CartService cartService;
    private final PaymentService paymentService;

    // 1) TEMP ORDER 생성
    @PostMapping("/prepare")
    public RsData<PrepareOrderResponse> preparePayment(
            @RequestBody CartOrderRequest request
    ) {
        SiteUser user = siteUserService.getCurrentUser();

        PrepareOrderResponse response = ordersService.prepareCartOrder(
                user,
                request.getItems(),
                request.getAddressId()
        );

        return RsData.of("200", "장바구니 주문 준비 성공", response);
    }

    // 2) 결제 승인 처리
    @PostMapping("/confirm")
    public RsData<Void> confirmCartPayment(
            @RequestBody PaymentConfirmRequest req
    ) {
        SiteUser user = siteUserService.getCurrentUser();

        paymentService.confirm(req, user);

        if (req.getCartIds() != null && !req.getCartIds().isEmpty()) {
            cartService.deletePurchasedItems(user, req.getCartIds());
        }

        return RsData.of("200", "장바구니 결제 승인 완료");
    }
}