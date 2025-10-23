package com.gobang.gobang.domain.personal.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.PaymentMethodRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.dto.response.PaymentMethodResponse;
import com.gobang.gobang.domain.personal.service.PaymentMethodService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/mypage/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    // 결제수단 목록 페이지
    @GetMapping
    @Operation(summary = "결제수단 목록 페이지")
    public RsData<List<PaymentMethodResponse>> paymentMethodList(@RequestParam(required = false) SiteUser siteUser) {
        if (siteUser == null) {
            return RsData.of("400", "유저 정보가 없습니다.");
        }

        List<PaymentMethodResponse> paymentMethod = paymentMethodService.getPaymentMethodsByUserId(siteUser);

        return RsData.of("200", "결제수단 다건 조회 성공", paymentMethod);
    }

    // 결제수단 등록
    @PostMapping
    @ResponseBody
    public ResponseEntity<PaymentMethodResponse> createPaymentMethod(@RequestBody PaymentMethodRequest request) {
        PaymentMethodResponse response = paymentMethodService.createPaymentMethod(request);
        return ResponseEntity.ok(response);
    }

    // 결제수단 수정
    @PatchMapping("/{paymentId}")
    @ResponseBody
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(
            @PathVariable Long paymentId,
            @RequestBody PaymentMethodRequest request) {
        PaymentMethodResponse response = paymentMethodService.updatePaymentMethod(paymentId, request);
        return ResponseEntity.ok(response);
    }

    // 결제수단 삭제
    @DeleteMapping("/{paymentId}")
    @ResponseBody
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Long paymentId) {
        paymentMethodService.deletePaymentMethod(paymentId);
        return ResponseEntity.ok().build();
    }

    // 기본 결제수단 설정
    @PatchMapping("/{paymentId}/default")
    @ResponseBody
    public ResponseEntity<Void> setDefaultPaymentMethod(
            @PathVariable Long paymentId,
            @RequestParam SiteUser siteUser) {
        paymentMethodService.setDefaultPaymentMethod(paymentId, siteUser);
        return ResponseEntity.ok().build();
    }
}