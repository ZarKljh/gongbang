package com.gobang.gobang.domain.delivery.service;

import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.delivery.dto.SellerDeliveryDetailResponse;
import com.gobang.gobang.domain.delivery.dto.UpdateDeliveryRequest;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.repository.DeliveryRepository;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerDeliveryService {

    private final OrdersRepository ordersRepository;
    private final DeliveryRepository deliveryRepository;
    private final StudioRepository studioRepository;

    /**
     * 주문이 해당 판매자의 스튜디오(공방) 주문인지 여부를 체크하는 내부 공통 메서드
     */
    private boolean isOrderOwnedBySeller(Orders order, Long sellerId) {
        // 1) 이 판매자가 가진 스튜디오들 조회
        List<Studio> studios = studioRepository.findBySiteUser_Id(sellerId);

        if (studios.isEmpty()) {
            return false;
        }

        // 2) 스튜디오 id 목록 생성
        List<Long> sellerStudioIds = studios.stream()
                .map(Studio::getStudioId)
                .toList();

        // 3) 주문 상품들의 studioId 가 위 목록에 포함되는지 검사
        return order.getOrderItems().stream()
                .map(OrderItem::getProduct)
                .filter(p -> p != null && p.getStudioId() != null)
                .anyMatch(p -> sellerStudioIds.contains(p.getStudioId()));
    }

    /**
     * 셀러용 배송 상세 조회
     * - 주문 + (있다면) 배송 1건 정보를 합쳐서 내려줌
     */
    @Transactional(readOnly = true)
    public RsData<SellerDeliveryDetailResponse> getDeliveryFromSeller(Long sellerId, Long orderId) {

        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) {
            return RsData.of("404", "존재하지 않는 주문입니다.", null);
        }

        // 🔐 이 주문이 이 판매자의 스튜디오 주문인지 검증
        boolean owned = isOrderOwnedBySeller(order, sellerId);
        if (!owned) {
            return RsData.of("403", "해당 주문의 판매자가 아닙니다.", null);
        }

        // 배송 정보는 없을 수도 있으므로 null 허용
        Delivery delivery = order.getDeliveries().stream()
                .findFirst()
                .orElse(null);

        SellerDeliveryDetailResponse dto = SellerDeliveryDetailResponse.of(order, delivery);

        return RsData.of("200", "배송 정보 조회 성공", dto);
    }

    /**
     * 셀러가 자신의 주문에 대해 배송 정보를 등록/수정
     */
    public RsData<?> updateDeliveryFromSeller(Long sellerId, Long orderId, UpdateDeliveryRequest req) {

        Orders order = ordersRepository.findById(orderId).orElse(null);
        if (order == null) {
            return RsData.of("404", "존재하지 않는 주문입니다.", null);
        }

        // 🔐 이 주문이 이 판매자의 스튜디오 주문인지 검증
        boolean owned = isOrderOwnedBySeller(order, sellerId);
        if (!owned) {
            return RsData.of("403", "해당 주문의 판매자가 아닙니다.", null);
        }

        // 주문에 연결된 배송 정보 (여러 개라면 첫 번째 사용)
        Delivery delivery = order.getDeliveries().stream()
                .findFirst()
                .orElse(null);

        if (delivery == null) {
            return RsData.of("404", "배송 정보가 없습니다. 관리자에게 문의해주세요.", null);
        }

        // 값 세팅
        delivery.setCourierName(req.getCourierName());
        delivery.setTrackingNumber(req.getTrackingNumber());

        if (req.getDeliveryStatus() != null && !req.getDeliveryStatus().isBlank()) {
            delivery.setDeliveryStatus(req.getDeliveryStatus());
        } else {
            // 기본값
            delivery.setDeliveryStatus("DELIVERING");
        }

        // 영속 상태지만, 명시적으로 save 호출
        deliveryRepository.save(delivery);

        return RsData.of("200", "배송 정보가 저장되었습니다.");
    }
}
