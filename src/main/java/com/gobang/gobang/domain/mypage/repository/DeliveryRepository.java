package com.gobang.gobang.domain.mypage.repository;


import com.gobang.gobang.domain.mypage.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    // 주문 ID로 배송 정보 조회
    Optional<Delivery> findByOrder_OrderId(Long orderId);

    // 송장번호로 배송 정보 조회
    Optional<Delivery> findByTrackingNumber(String trackingNumber);

    // 배송 상태별 조회
    List<Delivery> findByDeliveryStatus(String deliveryStatus);

    // 주소 ID로 배송 목록 조회
    @Query("SELECT d FROM Delivery d WHERE d.address.userAddressId = :addressId")
    List<Delivery> findByAddressId(@Param("addressId") Long addressId);
}
