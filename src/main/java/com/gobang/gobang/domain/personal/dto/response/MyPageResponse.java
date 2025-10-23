package com.gobang.gobang.domain.personal.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyPageResponse {
    private CartResponse cart;
    private DeliveryResponse delivery;
    private FollowResponse follow;
    private OrderItemResponse orderItem;
    private OrdersResponse order;
    private PaymentMethodResponse paymentMethod;
    private UserAddressResponse userAddress;
    private WishListResponse wishList;
}