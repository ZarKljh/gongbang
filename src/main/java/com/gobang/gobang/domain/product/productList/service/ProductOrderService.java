package com.gobang.gobang.domain.product.productList.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.product.dto.request.PrepareOrderRequest;
import com.gobang.gobang.domain.product.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductOrderService {
    private final OrdersRepository ordersRepository;
    private final ProductRepository productRepository;
    private final SiteUserRepository siteUserRepository;

    /**
     * 임시 주문 생성 (PENDING 상태)
     * - 프론트에서 Toss 결제 호출 전에 호출
     */
    public PrepareOrderResponse prepareOrder(Long userId, PrepareOrderRequest request) {

        // 0. quantity 기본값 처리 (null 방지)
        long quantity = request.getQuantity() != null ? request.getQuantity() : 1L;

        // 1. 유저 조회
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        // 2. 상품 조회
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품 정보를 찾을 수 없습니다."));

        // 3. 총 금액 계산 (basePrice: Integer → BigDecimal 변환 + quantity 곱)
        //    totalPrice = basePrice * quantity
        BigDecimal unitPrice = BigDecimal.valueOf(product.getBasePrice()); // Integer → BigDecimal
        BigDecimal totalPrice =
                unitPrice.multiply(BigDecimal.valueOf(quantity)); // Long → BigDecimal

        // 4. Toss 와 주고받을 주문코드 생성
        String orderCode = "ORD-" + UUID.randomUUID();

        // 5. Orders 엔티티 생성
        Orders orders = new Orders();
        orders.setSiteUser(user);
        orders.setOrderCode(orderCode);
        orders.setTotalPrice(totalPrice);
        orders.setStatus("PENDING");
        // createdDate는 @CreationTimestamp로 자동 설정

        // 6. OrderItem 생성 후 Orders에 연결
        OrderItem orderItem = OrderItem.builder()
                .order(orders)
                .product(product)
                .quantity(quantity)
                .price(unitPrice) // 단가 저장 (basePrice)
                .build();

        orders.getOrderItems().add(orderItem);

        // 7. 저장
        ordersRepository.save(orders);

        // 8. 프론트/토스로 넘길 값 반환
        return new PrepareOrderResponse(orderCode, totalPrice);
    }

    // 주문코드로 조회
    @Transactional(readOnly = true)
    public Orders findByOrderCode(String orderCode) {
        return ordersRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
    }

    // 2️⃣ 결제 완료 처리
    public void markPaid(Orders order, String paymentKey, String methodName) {
        order.setStatus("PAID");
        order.setPaymentKey(paymentKey);
        order.setPaymentMethodName(methodName);
        order.setPaidAt(LocalDateTime.now());
    }

}
