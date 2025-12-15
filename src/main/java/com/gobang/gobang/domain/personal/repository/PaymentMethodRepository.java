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

    List<PaymentMethod> findBySiteUserAndIsDeletedFalse(SiteUser siteUser);

    Optional<PaymentMethod> findByPaymentIdAndSiteUser(Long paymentId, SiteUser siteUser);

    boolean existsBySiteUserAndDefaultPayment(SiteUser siteUser, boolean defaultPayment);

    @Modifying
    @Query("""
        UPDATE PaymentMethod p
        SET p.defaultPayment = false
        WHERE p.siteUser = :siteUser
    """)
    void unsetDefaultBySiteUser(@Param("siteUser") SiteUser siteUser);
}