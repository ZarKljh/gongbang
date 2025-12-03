package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.OrderItemRepository;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdersService {

    private final OrdersRepository ordersRepository;
    private final OrderItemRepository orderItemRepository;

    // 사용자별 주문 목록 조회
    public List<OrdersResponse> getOrdersByUserId(SiteUser siteUser) {
        List<Orders> orders = ordersRepository.findBySiteUserWithDelivery(siteUser);
        List<Orders> distinctOrders = new ArrayList<>(new LinkedHashSet<>(orders)); //중복제거

        return distinctOrders.stream()
                .map(OrdersResponse::from)
                .collect(Collectors.toList());
    }

    // 주문 상세 조회
    public OrdersResponse getOrderDetail(Long orderId) {
        Orders order = ordersRepository.findByIdWithDeliveries(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        return OrdersResponse.from(order);
    }

    // 주문 삭제
    @Transactional
    public void deleteOrder(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        ordersRepository.delete(order);
    }

    // 주문 취소
    @Transactional(readOnly = false)
    public OrdersResponse cancelOrder(Long orderId, String reason) {
        Orders order = ordersRepository.findByIdWithDeliveries(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        // 배송 상태 확인
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

        return OrdersResponse.from(order);
    }

    // 반품 신청
    @Transactional(readOnly = false)
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

        return OrdersResponse.from(order);
    }

    // 교환 신청
    @Transactional(readOnly = false)
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

        return OrdersResponse.from(order);
    }

    public List<OrdersResponse> getInfiniteOrders(SiteUser user, Long lastOrderId, int size) {
        List<Orders> orders = ordersRepository.findInfiniteOrders(user.getId(), lastOrderId, size);

        return orders.stream()
                .map(OrdersResponse::from)
                .toList();
    }

}