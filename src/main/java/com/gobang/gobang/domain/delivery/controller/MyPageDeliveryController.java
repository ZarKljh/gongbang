package com.gobang.gobang.domain.delivery.controller;

import com.gobang.gobang.domain.delivery.dto.OrderTrackingDetailResponse;
import com.gobang.gobang.domain.delivery.service.DeliveryTrackingService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.config.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class MyPageDeliveryController {

    private final DeliveryTrackingService deliveryTrackingService;


    @GetMapping("/orders/{orderId}/tracking")
    public RsData<OrderTrackingDetailResponse> getMyOrderTracking(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long orderId
    ) {
        return deliveryTrackingService.getOrderTrackingForUser(user.getId(), orderId);
    }
}
