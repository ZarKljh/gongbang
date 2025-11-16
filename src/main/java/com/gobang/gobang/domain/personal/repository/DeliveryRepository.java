package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.personal.entity.Delivery;
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
}