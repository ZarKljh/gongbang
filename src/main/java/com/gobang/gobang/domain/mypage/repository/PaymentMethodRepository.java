package com.gobang.gobang.domain.mypage.repository;

import com.gobang.gobang.domain.mypage.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByUserId(Long userId);
    void deleteByPaymentIdAndUserId(Long paymentId, Long userId);
}
