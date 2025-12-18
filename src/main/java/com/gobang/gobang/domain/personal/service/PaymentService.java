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

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final OrdersRepository ordersRepository;
    private final TossPaymentClient tossPaymentClient;

    @Transactional
    public void confirm(PaymentConfirmRequest req, SiteUser user) {

        Orders order = ordersRepository
                .findByOrderCodeAndSiteUser(req.getOrderCode(), user)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        if (!order.isTemp()) {
            throw new IllegalStateException("이미 처리된 주문입니다.");
        }

        TossPaymentResponse tossRes = tossPaymentClient.confirm(req.getPaymentKey());

        if (!tossRes.isPaid()) {
            order.markFailed();      // 실패 처리
            throw new IllegalStateException("결제 승인 실패");
        }

        if (order.getTotalPrice().longValue() != req.getAmount()) {
            order.markFailed();
            throw new IllegalArgumentException("결제 금액 불일치");
        }

        order.markPaid(req.getPaymentKey(), tossRes.getMethod());
    }
}