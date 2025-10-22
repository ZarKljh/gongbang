package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class OrdersResponse {

    private Long orderId;
    private SiteUser siteUser;
    private String orderCord;
    private BigDecimal totalPrice;
    private LocalDateTime createdDate;

    // 주문 상품 목록
    private List<OrderItemResponse> orderItems;

    // 배송 정보
    private DeliveryResponse delivery;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long orderItemId;
        private Long orderId;
        private Product product;
        private String productName;
        private Long quantity;
        private BigDecimal price;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeliveryResponse {
        private Long deliveryId;
        private Long orderId;
        private String trackingNumber;
        private String deliveryStatus;
        private LocalDateTime completedAt;
        private LocalDateTime createdDate;
        private LocalDateTime modifiedDate;
        private UserAddressResponse address;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserAddressResponse {
        private Long userAddressId;
        private String recipientName;
        private String baseAddress;
        private String detailAddress;
        private String zipcode;
    }
}
