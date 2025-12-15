package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.CancelBeforePayRequest;
import com.gobang.gobang.domain.personal.dto.request.OrdersRequest;
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
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "주문 다건 조회 성공",
                ordersService.getOrdersByUser(user));
    }

    @GetMapping("/infinite")
    public RsData<List<OrdersResponse>> infiniteOrders(
            @RequestParam(required = false) Long lastOrderId,
            @RequestParam(defaultValue = "10") int size
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "주문 무한스크롤 조회 성공",
                ordersService.getInfiniteOrders(user, lastOrderId, size));
    }

    @GetMapping("/{orderId}")
    public RsData<OrdersResponse> getOrderDetail(@PathVariable Long orderId) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "주문 상세 조회 성공",
                ordersService.getOrderDetail(orderId, user));
    }

    @DeleteMapping("/{orderId}")
    public RsData<Void> deleteOrder(@PathVariable Long orderId) {
        SiteUser user = siteUserService.getCurrentUser();
        ordersService.deleteOrder(orderId, user);
        return RsData.of("200", "삭제 성공");
    }

    @PatchMapping("/{orderId}/cancel")
    public RsData<OrdersResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody OrdersRequest request
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "주문 취소 완료",
                ordersService.cancelOrder(orderId, user, request.getReason()));
    }

    @PatchMapping("/{orderId}/return")
    public RsData<OrdersResponse> returnOrder(
            @PathVariable Long orderId,
            @RequestBody OrdersRequest request
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "반품 신청 완료",
                ordersService.returnOrder(orderId, user, request.getReason()));
    }

    @PatchMapping("/{orderId}/exchange")
    public RsData<OrdersResponse> exchangeOrder(
            @PathVariable Long orderId,
            @RequestBody OrdersRequest request
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "교환 신청 완료",
                ordersService.exchangeOrder(orderId, user, request.getReason()));
    }

    @GetMapping("/{orderId}/delivery")
    public RsData<DeliveryResponse> getDeliveryDetail(@PathVariable Long orderId) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "배송 상세 조회 성공",
                deliveryService.getDeliveryByOrderId(orderId, user));
    }

    @PostMapping("/cancel-before-payment")
    public RsData<Void> cancelBeforePayment(@RequestBody CancelBeforePayRequest req) {
        SiteUser user = siteUserService.getCurrentUser();
        ordersService.cancelBeforePayment(user, req.getOrderCode());
        return RsData.of("200", "결제 취소로 인한 주문 삭제 완료");
    }
}