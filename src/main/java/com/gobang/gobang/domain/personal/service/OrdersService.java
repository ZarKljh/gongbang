package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.personal.dto.response.OrderItemResponse;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.dto.response.UserAddressResponse;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.OrderItemRepository;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
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

        return orders.stream()
                .map(OrdersResponse::from)
                .collect(Collectors.toList());
    }

    // 주문 상세 조회
    public OrdersResponse getOrderDetail(Long orderId) {
        Orders order = ordersRepository.findByIdWithDeliveryAndAddress(orderId)
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
}