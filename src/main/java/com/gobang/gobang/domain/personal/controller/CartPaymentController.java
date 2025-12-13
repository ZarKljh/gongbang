package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.service.OrdersService;
import com.gobang.gobang.domain.product.dto.request.ConfirmOrderRequest;
import com.gobang.gobang.domain.product.dto.response.ConfirmOrderResponse;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments/cart")
@RequiredArgsConstructor
public class CartPaymentController {

    private final OrdersService ordersService;

    @PostMapping("/confirm")
    public RsData<ConfirmOrderResponse> confirmCartPayment(
            @RequestBody ConfirmOrderRequest req,
            @AuthenticationPrincipal SiteUser user
    ) {
        if (user == null) {
            return RsData.of(
                    "401",
                    "로그인이 필요합니다.",
                    null
            );
        }

        ConfirmOrderResponse result = ordersService.confirmPayment(
                user,
                req.getOrderId(),   // ⚠ orderCode 값
                req.getPaymentKey(),
                req.getAmount()
        );

        return RsData.of(
                "200",
                "결제 승인 완료",
                result
        );
    }
}
