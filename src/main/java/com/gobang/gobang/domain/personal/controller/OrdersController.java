package com.gobang.gobang.domain.personal.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.DeliveryRequest;
import com.gobang.gobang.domain.personal.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.service.DeliveryService;
import com.gobang.gobang.domain.personal.service.OrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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
    public String ordersList(@RequestParam(required = false) SiteUser siteUser, Model model) {
        // TODO: 실제로는 세션에서 userId를 가져와야 함
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<OrdersResponse> orders = ordersService.getOrdersByUserId(siteUser);
        model.addAttribute("orders", orders);
        model.addAttribute("siteUser", siteUser);

        return "mypage/orders";
    }

    // 주문 상세 조회 (AJAX)
    @GetMapping("/{orderId}")
    @ResponseBody
    public ResponseEntity<OrdersResponse> getOrderDetail(@PathVariable Long orderId) {
        OrdersResponse order = ordersService.getOrderDetail(orderId);
        return ResponseEntity.ok(order);
    }

    // 주문 삭제 (AJAX)
    @DeleteMapping("/{orderId}")
    @ResponseBody
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        ordersService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }

    // 배송 정보 수정 (AJAX)
    @PatchMapping("/delivery")
    @ResponseBody
    public ResponseEntity<DeliveryResponse> updateDelivery(@RequestBody DeliveryRequest request) {
        DeliveryResponse response = deliveryService.updateDelivery(request);
        return ResponseEntity.ok(response);
    }
}
