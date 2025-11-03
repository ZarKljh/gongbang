package com.gobang.gobang.domain.personal.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.PaymentMethodRequest;
import com.gobang.gobang.domain.personal.dto.response.PaymentMethodResponse;
import com.gobang.gobang.domain.personal.service.PaymentMethodService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;
    private final SiteUserService siteUserService;

    @GetMapping
    @Operation(summary = "결제수단 목록 페이지")
    public RsData<List<PaymentMethodResponse>> paymentMethodList() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        List<PaymentMethodResponse> paymentMethods = paymentMethodService.getPaymentMethodsByUserId(siteUser);

        return RsData.of("200", "결제수단 다건 조회 성공", paymentMethods);
    }

    @PostMapping
    @ResponseBody
    @Operation(summary = "결제수단 등록")
    public RsData<PaymentMethodResponse> createPaymentMethod(@RequestBody PaymentMethodRequest request) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        request.setSiteUser(siteUser);
        PaymentMethodResponse response = paymentMethodService.createPaymentMethod(request);
        return RsData.of("200", "결제수단 등록 성공", response);
    }

    @PatchMapping("/{paymentId}/default")
    @ResponseBody
    @Operation(summary = "기본 결제수단 설정")
    public RsData<Void> setDefaultPaymentMethod(@PathVariable Long paymentId) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        paymentMethodService.setDefaultPaymentMethod(paymentId, siteUser);
        return RsData.of("200", "기본 결제수단 설정 성공");
    }

    @DeleteMapping("/{paymentId}")
    @ResponseBody
    @Operation(summary = "결제수단 삭제")
    public RsData<Void> deletePaymentMethod(@PathVariable Long paymentId) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        paymentMethodService.deletePaymentMethod(paymentId, siteUser);
        return RsData.of("200", "결제수단 삭제 성공");
    }
}