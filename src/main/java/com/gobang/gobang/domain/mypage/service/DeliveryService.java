package com.gobang.gobang.domain.mypage.service;

import com.gobang.gobang.domain.mypage.dto.request.DeliveryRequest;
import com.gobang.gobang.domain.mypage.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.mypage.entity.Delivery;
import com.gobang.gobang.domain.mypage.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    // 배송 정보 수정
    @Transactional
    public DeliveryResponse updateDelivery(DeliveryRequest request) {
        Delivery delivery = deliveryRepository.findById(request.getDeliveryId())
                .orElseThrow(() -> new IllegalArgumentException("배송 정보를 찾을 수 없습니다."));

        if (request.getTrackingNumber() != null) {
            delivery.setTrackingNumber(request.getTrackingNumber());
        }

        if (request.getDeliveryStatus() != null) {
            delivery.setDeliveryStatus(request.getDeliveryStatus());

            // 배송 완료 시 완료일 설정
            if ("배송완료".equals(request.getDeliveryStatus())) {
                delivery.setCompletedAt(LocalDateTime.now());
            }
        }

        return convertToResponse(delivery);
    }

    // 배송 정보 조회
    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("배송 정보를 찾을 수 없습니다."));

        return convertToResponse(delivery);
    }

    // Entity -> Response DTO 변환
    private DeliveryResponse convertToResponse(Delivery delivery) {
        DeliveryResponse.DeliveryResponseBuilder builder = DeliveryResponse.builder()
                .deliveryId(delivery.getDeliveryId())
                .orderId(delivery.getOrder().getOrderId())
                .trackingNumber(delivery.getTrackingNumber())
                .deliveryStatus(delivery.getDeliveryStatus())
                .completedAt(delivery.getCompletedAt())
                .createdDate(delivery.getCreatedDate())
                .modifiedDate(delivery.getModifiedDate());

        if (delivery.getAddress() != null) {
            builder.addressId(delivery.getAddress().getUserAddressId())
                    .recipientName(delivery.getAddress().getRecipientName())
                    .baseAddress(delivery.getAddress().getBaseAddress())
                    .detailAddress(delivery.getAddress().getDetailAddress())
                    .zipcode(delivery.getAddress().getZipcode());
        }

        return builder.build();
    }
}