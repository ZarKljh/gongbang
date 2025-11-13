package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.PaymentMethod;
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
    List<PaymentMethod> findBySiteUser(SiteUser siteUser);

    // 사용자의 모든 결제수단을 기본 결제수단 해제
    @Modifying
    @Query("UPDATE PaymentMethod pm SET pm.defaultPayment = false WHERE pm.siteUser = :siteUser")
    void unsetDefaultBySiteUser(@Param("siteUser") SiteUser siteUser);
}