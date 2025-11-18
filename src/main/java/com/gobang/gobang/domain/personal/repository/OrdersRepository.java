package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {

    // 사용자별 주문 목록 조회
    List<Orders> findBySiteUser(SiteUser siteUser);

    // 사용자별 주문 목록 (배송정보 포함)
    @Query(" SELECT o FROM Orders o LEFT JOIN FETCH o.deliveries d WHERE o.siteUser = :siteUser ORDER BY o.orderId DESC ")
    List<Orders> findBySiteUserWithDelivery(@Param("siteUser") SiteUser siteUser);

    // 주문 상세 조회 (배송정보 포함)
    @Query("SELECT o FROM Orders o LEFT JOIN FETCH o.deliveries d LEFT JOIN FETCH d.address WHERE o.orderId = :orderId")
    Optional<Orders> findByIdWithDeliveryAndAddress(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Orders o LEFT JOIN FETCH o.deliveries d LEFT JOIN FETCH d.address LEFT JOIN FETCH o.orderItems i WHERE o.orderId = :orderId")
    Optional<Orders> findByIdWithDelivery(@Param("orderId") Long orderId);
}