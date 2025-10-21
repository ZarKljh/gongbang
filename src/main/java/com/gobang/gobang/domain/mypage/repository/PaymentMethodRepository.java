package com.gobang.gobang.domain.mypage.repository;


import com.gobang.gobang.domain.mypage.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    // 사용자별 결제수단 목록 조회
    List<PaymentMethod> findByUser_UserId(Long id);

    // 사용자의 기본 결제수단 조회
    Optional<PaymentMethod> findByUser_UserIdAndDefaultPaymentTrue(Long id);

    // 사용자의 모든 결제수단을 기본 결제수단 해제
    @Modifying
    @Query("UPDATE PaymentMethod pm SET pm.defaultPayment = false WHERE pm.user.userId = :userId")
    void unsetDefaultByUserId(@Param("userId") Long id);

    // 결제수단 타입별 조회
    List<PaymentMethod> findByUser_UserIdAndType(Long id, String type);
}