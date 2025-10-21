package com.gobang.gobang.domain.mypage.repository;


import com.gobang.gobang.domain.mypage.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {

    // 사용자별 주문 목록 조회
    List<Orders> findByUserId(Long id);

    // 주문번호로 조회
    Optional<Orders> findByOrderCord(String orderCord);

    // 사용자별 주문 목록 (배송정보 포함)
    @Query("SELECT o FROM Orders o LEFT JOIN FETCH o.delivery WHERE o.userId = :userId ORDER BY o.orderId DESC")
    List<Orders> findByUserIdWithDelivery(@Param("userId") Long id);

    // 주문 상세 조회 (배송정보 포함)
    @Query("SELECT o FROM Orders o LEFT JOIN FETCH o.delivery d LEFT JOIN FETCH d.address WHERE o.orderId = :orderId")
    Optional<Orders> findByIdWithDeliveryAndAddress(@Param("orderId") Long id);
}