package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.Orders;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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
    Optional<Orders> findByIdWithDeliveries(@Param("orderId") Long orderId);

    //hj - 주문코드 조회하기
    Optional<Orders> findByOrderCode(String orderCode);

    @Query("""
        SELECT o FROM Orders o 
        WHERE o.siteUser.id = :userId
        AND (:lastOrderId IS NULL OR o.id < :lastOrderId)
        ORDER BY o.id DESC
    """)
    List<Orders> findInfiniteOrders(
            @Param("userId") Long userId,
            @Param("lastOrderId") Long lastOrderId,
            Pageable pageable
    );

    // 배송준비중, 배송중 전체 카운트
    @Query("""
        SELECT COUNT(o)
        FROM Orders o
        JOIN o.deliveries d
        WHERE o.siteUser.id = :userId
          AND d.deliveryStatus = :status
    """)
    long countByStatus(Long userId, String status);


    // 최근 7일 배송완료 카운트
    @Query("""
        SELECT COUNT(o)
        FROM Orders o
        JOIN o.deliveries d
        WHERE o.siteUser.id = :userId
          AND d.deliveryStatus = '배송완료'
          AND d.completedAt >= :sevenDaysAgo
    """)
    long countCompletedWithin7Days(Long userId, LocalDateTime sevenDaysAgo);
    // 셀러 기준으로 받은 주문 조회 - 상진
    @Query("""
                SELECT DISTINCT o
                FROM Orders o
                JOIN o.orderItems oi
                JOIN oi.product p
                WHERE p.studioId = :studioId
                ORDER BY o.orderId DESC
            """)
    List<Orders> findReceivedOrdersByStudioId(@Param("studioId") Long studioId);
}