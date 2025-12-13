package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.PaymentConfirmRequest;
import com.gobang.gobang.domain.personal.dto.response.TossPaymentResponse;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.global.util.TossPaymentClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final OrdersRepository ordersRepository;
    private final TossPaymentClient tossPaymentClient;

    public void confirm(PaymentConfirmRequest req, SiteUser user) {

        Orders order = ordersRepository
                .findByOrderCodeAndSiteUser(req.getOrderCode(), user)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        // 중복 결제 방지
        if (!order.isTemp()) {
            throw new IllegalStateException("이미 처리된 주문입니다.");
        }

        // 토스 서버 검증
        TossPaymentResponse tossRes =
                tossPaymentClient.confirm(req.getPaymentKey());

        if (!tossRes.isPaid()) {
            throw new IllegalStateException("결제 승인 실패");
        }

        // 금액 검증 (중요)
        if (!order.getTotalPrice().equals(
                BigDecimal.valueOf(tossRes.getTotalAmount()))) {
            throw new IllegalStateException("결제 금액 불일치");
        }

        // 결제 완료
        order.markPaid(
                tossRes.getPaymentKey(),
                tossRes.getMethod()
        );
    }
}