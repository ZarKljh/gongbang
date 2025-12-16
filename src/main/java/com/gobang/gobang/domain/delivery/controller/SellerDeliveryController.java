package com.gobang.gobang.domain.delivery.controller;

import com.gobang.gobang.domain.delivery.dto.OrderTrackingDetailResponse;
import com.gobang.gobang.domain.delivery.dto.SellerDeliveryDetailResponse;
import com.gobang.gobang.domain.delivery.dto.UpdateDeliveryRequest;
import com.gobang.gobang.domain.delivery.service.DeliveryTrackingService;
import com.gobang.gobang.domain.delivery.service.SellerDeliveryService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.config.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seller/orders")
@RequiredArgsConstructor
public class SellerDeliveryController {

    private final SellerDeliveryService sellerDeliveryService;
    private final DeliveryTrackingService deliveryTrackingService;

    @GetMapping("/{orderId}/delivery")
    public RsData<SellerDeliveryDetailResponse> getDeliveryInfo(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long orderId
    ) {
        if (user == null) {
            return RsData.of("401", "로그인이 필요합니다.", null);
        }

        Long sellerId = user.getId();
        return sellerDeliveryService.getDeliveryFromSeller(sellerId, orderId);
    }


    @PatchMapping("/{orderId}/delivery")
    public RsData<?> updateDeliveryInfo(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long orderId,
            @RequestBody UpdateDeliveryRequest req
    ) {
        Long sellerId = user.getId();
        return sellerDeliveryService.updateDeliveryFromSeller(sellerId, orderId, req);
    }

    @GetMapping("/{orderId}/tracking")
    public RsData<OrderTrackingDetailResponse> getTrackingForSeller(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long orderId
    ) {
        if (user == null) {
            return RsData.of("401", "로그인이 필요합니다.", null);
        }

        Long sellerId = user.getId();

        // 1) 이 주문이 이 셀러의 주문인지 검증 (재사용을 위해 service에 메서드 하나 두는 걸 추천)
        boolean owned = sellerDeliveryService.isSellerOwnerOfOrder(sellerId, orderId);
        if (!owned) {
            return RsData.of("403", "해당 주문의 판매자가 아닙니다.", null);
        }

        // 2) 검증 통과했으면 공통 트래킹 로직 호출
        return deliveryTrackingService.getOrderTrackingForAdmin(orderId);
    }
}
