package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.personal.dto.response.OrderItemResponse;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.dto.response.UserAddressResponse;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.DeliveryRepository;
import com.gobang.gobang.domain.personal.repository.OrderItemRepository;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdersService {

    private final OrdersRepository ordersRepository;
    private final OrderItemRepository orderItemRepository;
    private final DeliveryRepository deliveryRepository;

    // 사용자별 주문 목록 조회
    public List<OrdersResponse> getOrdersByUserId(SiteUser siteUser) {
        List<Orders> orders = ordersRepository.findBySiteUserWithDelivery(siteUser);

        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 주문 상세 조회
    public OrdersResponse getOrderDetail(Long orderId) {
        Orders order = ordersRepository.findByIdWithDeliveryAndAddress(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        return convertToResponse(order);
    }

    // 주문 삭제
    @Transactional
    public void deleteOrder(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        ordersRepository.delete(order);
    }

    // Entity -> Response DTO 변환
    private OrdersResponse convertToResponse(Orders order) {
        // 주문 상품 목록 조회
        List<OrderItem> orderItems = orderItemRepository.findByOrder_OrderId(order.getOrderId());

        List<OrderItemResponse> orderItemResponses = orderItems.stream()
                .map(item -> OrderItemResponse.builder()
                        .orderItemId(item.getOrderItemId())
                        .orderId(item.getOrder().getOrderId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        // 배송 정보 변환
        DeliveryResponse deliveryResponse = null;
        if (order.getDeliveries() != null) {
            Delivery delivery = order.getDeliveries().get(0);

            UserAddressResponse addressResponse = null;
            if (delivery.getAddress() != null) {
                addressResponse = UserAddressResponse.builder()
                        .userAddressId(delivery.getAddress().getUserAddressId())
                        .recipientName(delivery.getAddress().getRecipientName())
                        .baseAddress(delivery.getAddress().getBaseAddress())
                        .detailAddress(delivery.getAddress().getDetailAddress())
                        .zipcode(delivery.getAddress().getZipcode())
                        .build();
            }

            deliveryResponse = DeliveryResponse.builder()
                    .deliveryId(delivery.getDeliveryId())
                    .orderId(delivery.getOrder().getOrderId())
                    .trackingNumber(delivery.getTrackingNumber())
                    .deliveryStatus(delivery.getDeliveryStatus())
                    .completedAt(delivery.getCompletedAt())
                    .createdDate(delivery.getCreatedDate())
                    .modifiedDate(delivery.getModifiedDate())
                    .addressId(delivery.getAddress().getUserAddressId())
                    .build();
        }

        return OrdersResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getSiteUser().getId())
                .orderCord(order.getOrderCord())
                .totalPrice(order.getTotalPrice())
                .build();
    }
}