package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.CartOrderItemDto;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.personal.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdersService {

    private final OrdersRepository ordersRepository;
    private final ImageRepository imageRepository;
    private final ProductRepository productRepository;

    // 사용자별 주문 목록 조회
    public List<OrdersResponse> getOrdersByUserId(SiteUser siteUser) {
        List<Orders> orders = ordersRepository.findBySiteUserWithDelivery(siteUser);
        List<Orders> distinctOrders = new ArrayList<>(new LinkedHashSet<>(orders));

        return distinctOrders.stream()
                .map(order -> OrdersResponse.from(order, imageRepository))
                .collect(Collectors.toList());
    }

    // 주문 상세 조회
    public OrdersResponse getOrderDetail(Long orderId) {
        Orders order = ordersRepository.findByIdWithDeliveries(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        return OrdersResponse.from(order, imageRepository);
    }

    // 주문 삭제
    @Transactional
    public void deleteOrder(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        ordersRepository.delete(order);
    }

    // 주문 취소
    @Transactional
    public OrdersResponse cancelOrder(Long orderId, String reason) {
        Orders order = ordersRepository.findByIdWithDeliveries(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        order.getDeliveries().stream()
                .findFirst()
                .ifPresent(delivery -> {
                    if (!"배송준비중".equals(delivery.getDeliveryStatus())) {
                        throw new IllegalStateException("배송 준비중 상태일 때만 주문 취소가 가능합니다.");
                    }
                    delivery.setDeliveryStatus("취소");
                });

        order.setStatus("취소");
        order.setReason(reason);
        ordersRepository.save(order);

        return OrdersResponse.from(order, imageRepository);
    }

    // 반품 신청
    @Transactional
    public OrdersResponse returnOrder(Long orderId, String reason) {
        Orders order = ordersRepository.findByIdWithDeliveries(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        order.getDeliveries().stream()
                .findFirst()
                .ifPresent(delivery -> {
                    if (!"배송완료".equals(delivery.getDeliveryStatus())) {
                        throw new IllegalStateException("배송 완료된 주문만 반품 신청이 가능합니다.");
                    }
                    delivery.setDeliveryStatus("반품");
                });

        order.setStatus("반품");
        order.setReason(reason);
        ordersRepository.save(order);

        return OrdersResponse.from(order, imageRepository);
    }

    // 교환 신청
    @Transactional
    public OrdersResponse exchangeOrder(Long orderId, String reason) {
        Orders order = ordersRepository.findByIdWithDeliveries(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        order.getDeliveries().stream()
                .findFirst()
                .ifPresent(delivery -> {
                    if (!"배송완료".equals(delivery.getDeliveryStatus())) {
                        throw new IllegalStateException("배송 완료된 주문만 교환 신청이 가능합니다.");
                    }
                    delivery.setDeliveryStatus("교환");
                });

        order.setStatus("교환");
        order.setReason(reason);
        ordersRepository.save(order);

        return OrdersResponse.from(order, imageRepository);
    }

    public List<OrdersResponse> getInfiniteOrders(SiteUser user, Long lastOrderId, int size) {
        List<Orders> orders = ordersRepository.findInfiniteOrders(user.getId(), lastOrderId, size);

        return orders.stream()
                .map(order -> OrdersResponse.from(order, imageRepository))
                .toList();
    }

    @Transactional
    public PrepareOrderResponse prepareCartOrder(SiteUser user, List<CartOrderItemDto> items) {

        BigDecimal total = BigDecimal.ZERO;

        Orders order = Orders.createTempOrder(user);

        for (CartOrderItemDto item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

            BigDecimal price = BigDecimal.valueOf(product.getBasePrice());
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            total = total.add(itemTotal);

            order.addOrderItem(product, item.getQuantity(), price);
        }

        order.setTotalPrice(total);
        order.setOrderCode("ORD_" + UUID.randomUUID());

        ordersRepository.save(order);

        return new PrepareOrderResponse(order.getOrderCode(), total.longValueExact());
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