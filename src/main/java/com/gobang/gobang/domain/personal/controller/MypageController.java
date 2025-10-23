package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.response.*;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.service.CartService;
import com.gobang.gobang.domain.personal.service.DeliveryService;
import com.gobang.gobang.domain.personal.service.FollowService;
import com.gobang.gobang.global.RsData.RsData;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

@GetMapping("/mypage")
public RsData<MyPageResponse> getMyPage(@AuthenticationPrincipal SiteUser siteUser) {
    CartResponse cart = CartResponse.from();
    DeliveryResponse delivery = DeliveryResponse.from();
    FollowResponse follow = FollowResponse.from();
    OrderItemResponse orderItem = OrderItemResponse.from();
    OrdersResponse orders = OrdersResponse.from();
    PaymentMethodResponse paymentMethod = PaymentMethodResponse.from();
    UserAddressResponse userAddress = UserAddressResponse.from();
    WishListResponse wishList = WishListResponse.from();

    MyPageResponse response = MyPageResponse.builder()
            .cart(cart)
            .delivery(delivery)
            .follow(follow)
            .orderItem(orderItem)
            .order(orders)
            .paymentMethod(paymentMethod)
            .userAddress(userAddress)
            .wishList(wishList)
            .build();

    return RsData.of("200", "마이페이지 조회 성공", response);
}