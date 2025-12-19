package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.order.model.OrderStatus;
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

    @Query("""
        SELECT DISTINCT o
        FROM Orders o
        LEFT JOIN FETCH o.deliveries d
        WHERE o.siteUser = :user
          AND o.status <> 'TEMP'
        ORDER BY o.id DESC
    """)
    List<Orders> findValidOrders(@Param("user") SiteUser user);

    Optional<Orders> findByOrderIdAndSiteUser(Long orderId, SiteUser siteUser);

    @Query("""
        SELECT o
        FROM Orders o
        LEFT JOIN FETCH o.deliveries d
        WHERE o.id = :orderId
          AND o.siteUser = :user
    """)
    Optional<Orders> findByIdAndSiteUserWithDeliveries(
            @Param("orderId") Long orderId,
            @Param("user") SiteUser user
    );

    Optional<Orders> findByOrderCodeAndSiteUser(String orderCode, SiteUser siteUser);

    @Query("""
        SELECT o
        FROM Orders o
        WHERE o.siteUser.id = :userId
          AND (:lastOrderId IS NULL OR o.id < :lastOrderId)
          AND o.status <> 'TEMP'
        ORDER BY o.id DESC
    """)
    List<Orders> findInfiniteOrders(
            @Param("userId") Long userId,
            @Param("lastOrderId") Long lastOrderId,
            Pageable pageable
    );

    /* ===== 통계 ===== */

    @Query("""
        SELECT COUNT(o)
        FROM Orders o
        WHERE o.siteUser.id = :userId
          AND o.status = :orderStatus
    """)
    long countByStatus(Long userId, OrderStatus orderStatus);

    @Query("""
        SELECT COUNT(o)
        FROM Orders o
        JOIN o.deliveries d
        WHERE o.siteUser.id = :userId
          AND o.status = :orderStatus
          AND d = (
              SELECT d2 FROM Delivery d2
              WHERE d2.order = o
              ORDER BY d2.createdDate DESC
              LIMIT 1
          )
          AND d.deliveryStatus = :deliveryStatus
    """)
    long countByLatestDeliveryStatus(
            Long userId,
            String deliveryStatus,
            OrderStatus orderStatus
    );

    @Query("""
        SELECT COUNT(d)
        FROM Delivery d
        JOIN d.order o
        WHERE o.siteUser.id = :userId
          AND d.deliveryStatus = '배송완료'
          AND d.completedAt >= :from
    """)
    long countCompletedWithin7Days(
            @Param("userId") Long userId,
            @Param("from") LocalDateTime from
    );

    //hj - 주문코드 조회하기
    Optional<Orders> findByOrderCode(String orderCode);

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