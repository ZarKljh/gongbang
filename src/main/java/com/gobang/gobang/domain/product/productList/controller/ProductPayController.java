package com.gobang.gobang.domain.product.productList.controller;

import com.gobang.gobang.domain.product.dto.request.PrepareOrderRequest;
import com.gobang.gobang.domain.product.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.product.productList.service.ProductOrderService;
import com.gobang.gobang.global.config.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
public class ProductPayController {
    private final ProductOrderService productOrderService;
    //private final TossPaymentClient tossPaymentClient;

    @PostMapping("/prepare")
    public ResponseEntity<PrepareOrderResponse> prepareOrder(
            @RequestBody PrepareOrderRequest request,
            @AuthenticationPrincipal SecurityUser user // 효중님 프로젝트에 맞게 타입 수정
    ) {
        if (user == null) {
            // 방법 1: 예외 던지기
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Long userId = user.getId(); // or customUser.getSiteUser().getId()

        PrepareOrderResponse response = productOrderService.prepareOrder(userId, request);

        return ResponseEntity.ok(response);
    }



}
