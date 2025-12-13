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

    public List<PaymentMethodResponse> getPaymentMethodsByUser(SiteUser user) {
        return paymentMethodRepository.findBySiteUserAndIsDeletedFalse(user)
                .stream()
                .map(PaymentMethodResponse::from)
                .toList();
    }

    @Transactional
    public PaymentMethodResponse createPaymentMethod(
            PaymentMethodRequest request, SiteUser user
    ) {
        boolean hasDefault = paymentMethodRepository.existsBySiteUserAndDefaultPayment(user, true);
        boolean isDefault = Boolean.TRUE.equals(request.getDefaultPayment()) || !hasDefault;

        if (isDefault) {
            paymentMethodRepository.unsetDefaultBySiteUser(user);
        }

        PaymentMethod pm = PaymentMethod.from(request, user, isDefault);
        return PaymentMethodResponse.from(paymentMethodRepository.save(pm));
    }

    @Transactional
    public void deletePaymentMethod(Long paymentId, SiteUser user) {
        PaymentMethod pm = paymentMethodRepository.findByPaymentIdAndSiteUser(paymentId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        pm.setIsDeleted(true);
    }

    @Transactional
    public void setDefaultPayment(Long paymentId, SiteUser user) {
        PaymentMethod pm = paymentMethodRepository.findByPaymentIdAndSiteUser(paymentId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        paymentMethodRepository.unsetDefaultBySiteUser(user);
        pm.setDefaultPayment(true);
    }
}