package com.gobang.gobang.domain.delivery.service;

import com.gobang.gobang.domain.delivery.dto.OrderTrackingDetailResponse;
import com.gobang.gobang.domain.delivery.dto.TrackingStepDto;
import com.gobang.gobang.domain.delivery.entity.DeliveryTracking;
import com.gobang.gobang.domain.delivery.repository.DeliveryTrackingRepository;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.infra.DeliveryTrackerClient;
import com.gobang.gobang.domain.delivery.infrastructure.CarrierCodeMapper;
import lombok.RequiredArgsConstructor;
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
    private final DeliveryTrackerClient deliveryTrackerClient;
    private final CarrierCodeMapper carrierCodeMapper;


    /**
     * 마이페이지(일반 유저)용 배송 추적
     */
    public RsData<OrderTrackingDetailResponse> getOrderTrackingForUser(Long userId, Long orderId) {
        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) {
            return RsData.of("404", "존재하지 않는 주문입니다.", null);
        }

        if (!order.getSiteUser().getId().equals(userId)) {
            return RsData.of("403", "본인의 주문만 조회할 수 있습니다.", null);
        }

        return buildOrderTrackingResponse(order);
    }

    /**
     * 관리자용 배송 추적
     */
    public RsData<OrderTrackingDetailResponse> getOrderTrackingForAdmin(Long orderId) {
        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) {
            return RsData.of("404", "존재하지 않는 주문입니다.", null);
        }
        return buildOrderTrackingResponse(order);
    }

    /**
     * 공통 응답 빌더
     */
    private RsData<OrderTrackingDetailResponse> buildOrderTrackingResponse(Orders order) {

        // 1) 배송 정보
        Delivery delivery = order.getDeliveries().stream()
                .findFirst()
                .orElse(null);

        if (delivery == null) {
            return RsData.of("404", "배송 정보가 없습니다.", null);
        }

        // 2) 주문 상품 1개 (대표 상품)
        OrderItem firstItem = order.getOrderItems().stream()
                .findFirst()
                .orElse(null);

        if (firstItem == null) {
            return RsData.of("404", "주문 상품 정보가 없습니다.", null);
        }

        Product product = firstItem.getProduct();

        // 3) 택배사 코드 매핑
        String carrierCode = carrierCodeMapper.toCarrierCode(delivery.getCourierName());
        System.out.println("mapped carrierCode = " + carrierCode);

        // 4) Delivery Tracker API 호출 → 실시간 이벤트 목록
        List<TrackingStepDto> steps = List.of();

        if (carrierCode != null &&
                delivery.getTrackingNumber() != null &&
                !delivery.getTrackingNumber().isBlank()) {

            steps = deliveryTrackerClient.getTrackingSteps(
                    carrierCode,
                    delivery.getTrackingNumber()
            );
            System.out.println("steps from DeliveryTrackerClient size = " + steps.size());
        } else {
            System.out.println("carrierCode or trackingNumber is null/blank, skip external call");
        }

        // 5) 만약 외부 API에서 아무 이벤트도 못 받았으면,
        //    (선택) DB에 저장된 DeliveryTracking 이력을 fallback 으로 사용
        if (steps == null || steps.isEmpty()) {
            List<DeliveryTracking> trackingList =
                    deliveryTrackingRepository.findByDeliveryOrderByEventTimeDesc(delivery);

            steps = trackingList.stream()
                    .sorted(Comparator.comparing(DeliveryTracking::getEventTime).reversed())
                    .map(t -> TrackingStepDto.builder()
                            .location(t.getLocation())
                            .status(t.getStatus())
                            .time(t.getEventTime())
                            .build())
                    .toList();

            System.out.println("steps from DB fallback size = " + steps.size());
        }

        // 6) 실시간 이벤트(steps) + 기존 DB 상태(delivery.getDeliveryStatus())를 합쳐서
        //    화면에서 쓸 "현재 배송 상태 코드" 계산
        String currentStatus = resolveStatusFromSteps(steps, delivery.getDeliveryStatus());

        // (선택) DB 상태도 같이 업데이트하고 싶으면 주석 해제
        // delivery.setDeliveryStatus(currentStatus);
        // 여기서 save 할 경우, readOnly = true 제거 및 repository save 필요

        // 7) 상품 부가 정보(브랜드/옵션/이미지)는 추후 필요시 채우기
        String productBrand = "";
        String productOption = "";
        String productImageUrl = null;

        OrderTrackingDetailResponse response = OrderTrackingDetailResponse.builder()
                .orderId(order.getOrderId())
                .orderCode(order.getOrderCode())
                .orderCreatedDate(order.getCreatedDate())
                .orderStatus(order.getStatus())
                .deliveryStatus(currentStatus) // 🔹 여기! 실시간 기준 상태 코드
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

    /**
     * 실시간 이벤트(steps)를 보고 현재 배송 상태를 요약 코드로 변환
     * - DELIVERED : 배송 완료
     * - DELIVERING : 배송 중
     * - 그 외      : 배송 준비중
     */
    private String resolveStatusFromSteps(List<TrackingStepDto> steps, String defaultStatus) {
        if (steps == null || steps.isEmpty()) {
            return defaultStatus != null ? defaultStatus : "배송준비중";
        }

        // time 있는 이벤트 중 가장 최신 1개 찾기
        TrackingStepDto latest = steps.stream()
                .filter(s -> s.getTime() != null)
                .max(Comparator.comparing(TrackingStepDto::getTime))
                .orElse(steps.get(0));

        String text = latest.getStatus() != null ? latest.getStatus() : "";
        String upper = text.toUpperCase();

        // 1) 배송 완료 케이스
        if (upper.contains("배송 완료")
                || upper.contains("DELIVERED")
                || upper.contains("배달완료")) {
            return "DELIVERED";
        }

        // 2) 배송 중 / 출발
        if (upper.contains("배송 출발")
                || upper.contains("배송중")
                || upper.contains("IN_TRANSIT")
                || upper.contains("배달출발")) {
            return "DELIVERING";
        }

        // 3) 그 외는 준비중
        return defaultStatus != null ? defaultStatus : "배송준비중";
    }
}
