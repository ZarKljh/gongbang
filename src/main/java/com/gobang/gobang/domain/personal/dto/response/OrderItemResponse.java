package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long orderItemId;
    private Long orderId;
    private Long productId;
    private String productName;
    private Long quantity;
    private BigDecimal price;
    private String imageUrl;

    public static OrderItemResponse from(OrderItem orderItem, ImageRepository imageRepository) {
        String imageUrl = imageRepository
                .findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.PRODUCT, orderItem.getProduct().getId())
                .stream()
                .findFirst()
                .map(img -> "/api/v1/image/product/" + img.getImageFileName())
                .orElse(null);

        return OrderItemResponse.builder()
                .orderItemId(orderItem.getOrderItemId())
                .orderId(orderItem.getOrder().getOrderId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProduct().getName())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .imageUrl(imageUrl)
                .build();
    }
}