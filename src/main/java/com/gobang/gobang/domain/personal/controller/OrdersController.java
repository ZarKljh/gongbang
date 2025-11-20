package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.DeliveryRequest;
import com.gobang.gobang.domain.personal.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.service.DeliveryService;
import com.gobang.gobang.domain.personal.service.OrdersService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService ordersService;
    private final DeliveryService deliveryService;
    private final SiteUserService siteUserService;

    @GetMapping
    public RsData<List<OrdersResponse>> ordersList() {
        SiteUser siteUser = siteUserService.getCurrentUser();
        List<OrdersResponse> orders = ordersService.getOrdersByUserId(siteUser);
        return RsData.of("200", "주문 다건 조회 성공", orders);
    }

    @GetMapping("/{orderId}")
    public RsData<OrdersResponse> getOrderDetail(@PathVariable Long orderId) {
        OrdersResponse orders = ordersService.getOrderDetail(orderId);
        return RsData.of("200", "주문 상세 조회 성공", orders);
    }

    @DeleteMapping("/{orderId}")
    public RsData<Void> deleteOrder(@PathVariable Long orderId) {
        ordersService.deleteOrder(orderId);
        return RsData.of("200", "삭제 성공");
    }

    @PatchMapping("/{orderId}/cancel")
    public RsData<OrdersResponse> cancelOrder(@PathVariable Long orderId) {
        OrdersResponse orders = ordersService.cancelOrder(orderId);
        return RsData.of("200", "주문 취소 완료", orders);
    }

    @PatchMapping("/{orderId}/return")
    public RsData<OrdersResponse> returnOrder(@PathVariable Long orderId) {
        OrdersResponse orders = ordersService.returnOrder(orderId);
        return RsData.of("200", "반품 신청 완료", orders);
    }

    @PatchMapping("/{orderId}/exchange")
    public RsData<OrdersResponse> exchangeOrder(@PathVariable Long orderId) {
        OrdersResponse orders = ordersService.exchangeOrder(orderId);
        return RsData.of("200", "교환 신청 완료", orders);
    }

    @PatchMapping("/delivery")
    public RsData<DeliveryResponse> updateDelivery(@RequestBody DeliveryRequest request) {
        DeliveryResponse response = deliveryService.updateDelivery(request);
        return RsData.of("200", "배송 정보 수정 성공", response);
    }

    @GetMapping("/{orderId}/delivery")
    public RsData<DeliveryResponse> getDeliveryDetail(@PathVariable Long orderId) {
        DeliveryResponse delivery = deliveryService.getDeliveryByOrderId(orderId);
        return RsData.of("200", "배송 상세 조회 성공", delivery);
    }
}