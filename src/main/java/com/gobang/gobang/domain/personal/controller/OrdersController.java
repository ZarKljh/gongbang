package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.MyPageDTO;
import com.gobang.gobang.domain.personal.dto.request.DeliveryRequest;
import com.gobang.gobang.domain.personal.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.service.DeliveryService;
import com.gobang.gobang.domain.personal.service.OrdersService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
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

    @PatchMapping("/delivery")
    public RsData<DeliveryResponse> updateDelivery(@RequestBody DeliveryRequest request) {
        DeliveryResponse response = deliveryService.updateDelivery(request);
        return RsData.of("200", "배송 정보 수정 성공", response);
    }
}