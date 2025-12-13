package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.DeliveryRequest;
import com.gobang.gobang.domain.personal.dto.response.DeliveryResponse;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    @Transactional
    public DeliveryResponse updateDelivery(DeliveryRequest request, SiteUser user) {
        Delivery delivery = deliveryRepository
                .findByDeliveryIdAndOrder_SiteUser_Id(request.getDeliveryId(), user.getId())
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        if (request.getTrackingNumber() != null) {
            delivery.setTrackingNumber(request.getTrackingNumber());
        }

        if (request.getDeliveryStatus() != null) {
            delivery.setDeliveryStatus(request.getDeliveryStatus());
            if ("배송완료".equals(request.getDeliveryStatus())) {
                delivery.setCompletedAt(LocalDateTime.now());
            }
        }

        return DeliveryResponse.from(delivery);
    }

    public DeliveryResponse getDeliveryByOrderId(Long orderId, SiteUser user) {
        Delivery delivery = deliveryRepository
                .findByOrder_OrderIdAndOrder_SiteUser(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        return DeliveryResponse.from(delivery);
    }
}
