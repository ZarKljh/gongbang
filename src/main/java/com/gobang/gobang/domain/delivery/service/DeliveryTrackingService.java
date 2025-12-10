package com.gobang.gobang.domain.delivery.service;

import com.gobang.gobang.domain.delivery.dto.OrderTrackingDetailResponse;
import com.gobang.gobang.domain.delivery.dto.TrackingStepDto;
import com.gobang.gobang.domain.delivery.entity.DeliveryTracking;
import com.gobang.gobang.domain.delivery.infrastructure.CarrierCodeMapper;
import com.gobang.gobang.domain.delivery.infrastructure.TrackerDeliveryClient;
import com.gobang.gobang.domain.delivery.repository.DeliveryTrackingRepository;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeliveryTrackingService {

    private final OrdersRepository ordersRepository;
    private final DeliveryTrackingRepository deliveryTrackingRepository;
    private final TrackerDeliveryClient trackerDeliveryClient;
    private final CarrierCodeMapper carrierCodeMapper;


    public RsData<OrderTrackingDetailResponse> getOrderTrackingForUser(Long userId, Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));

        if (!order.getSiteUser().getId().equals(userId)) {
            throw new AccessDeniedException("본인의 주문만 조회할 수 있습니다.");
        }

        return buildOrderTrackingResponse(order);
    }


    public RsData<OrderTrackingDetailResponse> getOrderTrackingForAdmin(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));
        return buildOrderTrackingResponse(order);
    }

    private RsData<OrderTrackingDetailResponse> buildOrderTrackingResponse(Orders order) {

        // 주문 내 첫 번째 배송 정보 기준
        Delivery delivery = order.getDeliveries().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("배송 정보가 없습니다."));

        // 주문 상품 1개만 노출
        OrderItem firstItem = order.getOrderItems().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("주문 상품 정보가 없습니다."));

        Product product = firstItem.getProduct();

        String carrierCode = carrierCodeMapper.toCarrierCode(delivery.getCourierName());
        List<TrackingStepDto> trackingSteps = List.of();

        if (carrierCode != null && delivery.getTrackingNumber() != null) {
            trackingSteps = trackerDeliveryClient.getTrackingSteps(
                    carrierCode,
                    delivery.getTrackingNumber()
            );
        }

        List<DeliveryTracking> trackingList =
                deliveryTrackingRepository.findByDeliveryOrderByEventTimeDesc(delivery);

        // 시간 역순 → 프론트에서 최근 단계가 맨 위에 보이도록
        List<TrackingStepDto> steps = trackingList.stream()
                .sorted(Comparator.comparing(DeliveryTracking::getEventTime).reversed())
                .map(t -> TrackingStepDto.builder()
                        .location(t.getLocation())
                        .status(t.getStatus())
                        .time(t.getEventTime())
                        .build())
                .toList();

        String productBrand = "";
        String productOption = "";
        String productImageUrl = null;

        OrderTrackingDetailResponse response = OrderTrackingDetailResponse.builder()
                .orderId(order.getOrderId())
                .orderCode(order.getOrderCode())
                .orderCreatedDate(order.getCreatedDate())
                .orderStatus(order.getStatus())
                .deliveryStatus(delivery.getDeliveryStatus())
                .courierName(delivery.getCourierName())
                .trackingNumber(delivery.getTrackingNumber())
                .productBrand(productBrand)
                .productName(product.getName())
                .productOption(productOption)
                .productPrice(product.getBasePrice())
                .productQuantity(firstItem.getQuantity().intValue())
                .productImageUrl(productImageUrl)
                .steps(steps)
                .build();

        return RsData.of("200", "배송 조회 성공", response);
    }
}
