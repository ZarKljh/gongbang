package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.PaymentMethodRequest;
import com.gobang.gobang.domain.personal.dto.response.PaymentMethodResponse;
import com.gobang.gobang.domain.personal.entity.PaymentMethod;
import com.gobang.gobang.domain.personal.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    // 결제수단 리스트 조회 (소프트 삭제 제외)
    public List<PaymentMethodResponse> getPaymentMethodsByUserId(SiteUser user) {
        return paymentMethodRepository.findBySiteUserAndIsDeletedFalse(user)
                .stream()
                .map(PaymentMethodResponse::from)
                .sorted((a, b) -> {
                    // 기본 결제수단 우선
                    if (a.getDefaultPayment() && !b.getDefaultPayment()) return -1;
                    if (!a.getDefaultPayment() && b.getDefaultPayment()) return 1;
                    // 최신순
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();
    }

    @Transactional
    public PaymentMethodResponse createPaymentMethod(PaymentMethodRequest request) {

        // 기본 결제수단으로 등록할 경우 기존 결제수단 모두 해제
        if (Boolean.TRUE.equals(request.getDefaultPayment())) {
            paymentMethodRepository.unsetDefaultBySiteUser(request.getSiteUser());
        }

        // 카드 번호 마스킹
        String maskedCard = null;
        if (request.getCardNumber() != null) {
            maskedCard = maskCardNumber(request.getCardNumber());
        }

        PaymentMethod pm = PaymentMethod.builder()
                .siteUser(request.getSiteUser())
                .type(request.getType())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .accountHolder(request.getAccountHolder())
                .cardCompany(request.getCardCompany())
                .cardNumber(maskedCard)
                .cardExpire(request.getCardExpire())
                .defaultPayment(request.getDefaultPayment() != null && request.getDefaultPayment())
                .build();

        return PaymentMethodResponse.from(paymentMethodRepository.save(pm));
    }

    @Transactional
    public void deletePaymentMethod(Long paymentId, SiteUser user) {
        PaymentMethod pm = paymentMethodRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("결제수단 없음"));

        if (!pm.getSiteUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("본인 결제수단만 삭제 가능");
        }

        pm.setIsDeleted(true);
    }

    @Transactional
    public void setDefaultPayment(Long paymentId, SiteUser user) {
        PaymentMethod pm = paymentMethodRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("결제수단 없음"));

        paymentMethodRepository.unsetDefaultBySiteUser(user);
        pm.setDefaultPayment(true);
    }


    private String maskCardNumber(String cardNumber) {
        if (cardNumber.length() < 4) return cardNumber;

        String last = cardNumber.substring(cardNumber.length() - 4);

        return "****-****-****-" + last;
    }
}