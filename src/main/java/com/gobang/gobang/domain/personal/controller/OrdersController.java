package com.gobang.gobang.domain.personal.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.DeliveryRequest;
import com.gobang.gobang.domain.personal.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.service.DeliveryService;
import com.gobang.gobang.domain.personal.service.OrdersService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/mypage/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService ordersService;
    private final DeliveryService deliveryService;

    // 주문 목록 페이지
    @GetMapping
    @Operation(summary = "주문 다건 조회")
    public RsData<List<OrdersResponse>> ordersList(@RequestParam(required = false) SiteUser siteUser) {
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<OrdersResponse> orders = ordersService.getOrdersByUserId(siteUser);

        return RsData.of("200", "장바구니 다건 조회 성공", orders);
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    @ResponseBody
    @Operation(summary = "주문 상세 조회")
    public ResponseEntity<OrdersResponse> getOrderDetail(@PathVariable Long orderId) {
        OrdersResponse order = ordersService.getOrderDetail(orderId);
        return ResponseEntity.ok(order);
    }

    // 주문 삭제
    @DeleteMapping("/{orderId}")
    @ResponseBody
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        ordersService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }

    // 배송 정보 수정
    @PatchMapping("/delivery")
    @ResponseBody
    public ResponseEntity<DeliveryResponse> updateDelivery(@RequestBody DeliveryRequest request) {
        DeliveryResponse response = deliveryService.updateDelivery(request);
        return ResponseEntity.ok(response);
    }
}
