package com.gobang.gobang.domain.delivery.controller;

import com.gobang.gobang.domain.delivery.dto.OrderTrackingDetailResponse;
import com.gobang.gobang.domain.delivery.service.DeliveryTrackingService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/delivery")
@RequiredArgsConstructor
public class AdminDeliveryController {

    private final DeliveryTrackingService deliveryTrackingService;

    /**
     * 관리자 화면에서 주문 배송 조회
     * GET /api/v1/admin/delivery/orders/{orderId}/tracking
     */
    @PreAuthorize("hasRole('ADMIN')") // 권한 정책에 맞게 수정
    @GetMapping("/orders/{orderId}/tracking")
    public RsData<OrderTrackingDetailResponse> getOrderTrackingForAdmin(
            @PathVariable Long orderId
    ) {
        return deliveryTrackingService.getOrderTrackingForAdmin(orderId);
    }
}
