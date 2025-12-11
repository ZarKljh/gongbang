package com.gobang.gobang.domain.delivery.controller;

import com.gobang.gobang.domain.delivery.dto.SellerDeliveryDetailResponse;
import com.gobang.gobang.domain.delivery.dto.UpdateDeliveryRequest;
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
}
