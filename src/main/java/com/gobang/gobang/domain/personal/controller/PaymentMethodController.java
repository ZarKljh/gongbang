package com.gobang.gobang.domain.personal.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.PaymentMethodRequest;
import com.gobang.gobang.domain.personal.dto.response.PaymentMethodResponse;
import com.gobang.gobang.domain.personal.service.PaymentMethodService;
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
    public String paymentMethodList(@RequestParam(required = false) SiteUser siteUser, Model model) {
        // TODO: 실제로는 세션에서 userId를 가져와야 함
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<PaymentMethodResponse> paymentMethods = paymentMethodService.getPaymentMethodsByUserId(siteUser);
        model.addAttribute("paymentMethods", paymentMethods);
        model.addAttribute("siteUser", siteUser);

        return "mypage/payment-methods";
    }

    // 결제수단 등록 (AJAX)
    @PostMapping
    @ResponseBody
    public ResponseEntity<PaymentMethodResponse> createPaymentMethod(@RequestBody PaymentMethodRequest request) {
        PaymentMethodResponse response = paymentMethodService.createPaymentMethod(request);
        return ResponseEntity.ok(response);
    }

    // 결제수단 수정 (AJAX)
    @PatchMapping("/{paymentId}")
    @ResponseBody
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(
            @PathVariable Long paymentId,
            @RequestBody PaymentMethodRequest request) {
        PaymentMethodResponse response = paymentMethodService.updatePaymentMethod(paymentId, request);
        return ResponseEntity.ok(response);
    }

    // 결제수단 삭제 (AJAX)
    @DeleteMapping("/{paymentId}")
    @ResponseBody
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Long paymentId) {
        paymentMethodService.deletePaymentMethod(paymentId);
        return ResponseEntity.ok().build();
    }

    // 기본 결제수단 설정 (AJAX)
    @PatchMapping("/{paymentId}/default")
    @ResponseBody
    public ResponseEntity<Void> setDefaultPaymentMethod(
            @PathVariable Long paymentId,
            @RequestParam SiteUser siteUser) {
        paymentMethodService.setDefaultPaymentMethod(paymentId, siteUser);
        return ResponseEntity.ok().build();
    }
}