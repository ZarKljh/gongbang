package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.order.model.OrderStatus;
import com.gobang.gobang.domain.personal.dto.CartOrderItemDto;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.entity.UserAddress;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.personal.repository.UserAddressRepository;
import com.gobang.gobang.domain.product.dto.response.ConfirmOrderResponse;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdersService {

    private final OrdersRepository ordersRepository;
    private final UserAddressRepository userAddressRepository;
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    public List<OrdersResponse> getOrdersByUser(SiteUser user) {
        return ordersRepository.findValidOrders(user)
                .stream()
                .distinct()
                .map(o -> OrdersResponse.from(o, imageRepository))
                .toList();
    }

    public OrdersResponse getOrderDetail(Long orderId, SiteUser user) {
        Orders order = ordersRepository.findByOrderIdAndSiteUser(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        return OrdersResponse.from(order, imageRepository);
    }

    @Transactional
    public void deleteOrder(Long orderId, SiteUser user) {
        Orders order = ordersRepository.findByOrderIdAndSiteUser(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        ordersRepository.delete(order);
    }

    @Transactional
    public OrdersResponse cancelOrder(Long orderId, SiteUser user, String reason) {
        Orders order = ordersRepository.findByIdAndSiteUserWithDeliveries(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        order.cancel(reason);
        return OrdersResponse.from(order, imageRepository);
    }

    @Transactional
    public OrdersResponse returnOrder(Long orderId, SiteUser user, String reason) {
        Orders order = ordersRepository.findByIdAndSiteUserWithDeliveries(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        order.returnOrder(reason);
        return OrdersResponse.from(order, imageRepository);
    }

    @Transactional
    public OrdersResponse exchangeOrder(Long orderId, SiteUser user, String reason) {
        Orders order = ordersRepository.findByIdAndSiteUserWithDeliveries(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        order.exchange(reason);
        return OrdersResponse.from(order, imageRepository);
    }

    public List<OrdersResponse> getInfiniteOrders(SiteUser user, Long lastOrderId, int size) {
        Pageable pageable = PageRequest.of(0, size);

        return ordersRepository.findInfiniteOrders(user.getId(), lastOrderId, pageable)
                .stream()
                .map(o -> OrdersResponse.from(o, imageRepository))
                .toList();
    }

    @Transactional
    public ConfirmOrderResponse confirmPayment(
            SiteUser user,
            String orderCode,
            String paymentKey,
            long amount
    ) {
        Orders order = ordersRepository.findByOrderCodeAndSiteUser(orderCode, user)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        if (order.getStatus() != OrderStatus.TEMP) {
            throw new IllegalStateException("이미 결제가 처리된 주문입니다.");
        }

        if (order.getTotalPrice().longValue() != amount) {
            throw new IllegalArgumentException("결제 금액이 일치하지 않습니다.");
        }

        order.markPaid(paymentKey, "TOSS");

        return new ConfirmOrderResponse(
                order.getOrderCode(),
                paymentKey,
                amount,
                "DONE",
                "결제가 정상적으로 완료되었습니다."
        );
    }

    @Transactional
    public PrepareOrderResponse prepareCartOrder(
            SiteUser user,
            List<CartOrderItemDto> items,
            Long addressId
    ) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("요청을 처리할 수 없습니다.");
        }

        UserAddress address = userAddressRepository
                .findByUserAddressIdAndSiteUser_Id(addressId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        // TEMP 주문 생성 (결제 전)
        Orders order = Orders.createTempOrder(user);

        // Toss에 넘길 orderId = orderCode
        String orderCode = "ORD_" + UUID.randomUUID();
        order.setOrderCode(orderCode);

        BigDecimal total = BigDecimal.ZERO;

        // 주문 상품 생성
        for (CartOrderItemDto item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

            BigDecimal price = BigDecimal.valueOf(product.getBasePrice());
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            order.addOrderItem(product, item.getQuantity(), price);
            total = total.add(itemTotal);
        }

        // 배송 정보 추가
        order.addDelivery(address);

        // 총 금액 설정
        order.setTotalPrice(total);

        // 반드시 DB 저장
        ordersRepository.save(order);

        return new PrepareOrderResponse(orderCode, total.longValueExact());
    }

    @Transactional
    public void cancelBeforePayment(SiteUser user, String orderCode) {
        Orders order = ordersRepository.findByOrderCodeAndSiteUser(orderCode, user)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        ordersRepository.delete(order);
    }

    // 셀러용 받은 주문 조회 - 상진
    @Transactional(readOnly = true)
    public List<OrdersResponse> getReceivedOrdersByStudio(Long studioId) {
        List<Orders> orders = ordersRepository.findReceivedOrdersByStudioId(studioId);

        return orders.stream()
                .map(order -> OrdersResponse.from(order, imageRepository))
                .toList();
    }
}