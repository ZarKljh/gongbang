package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    List<PaymentMethod> findBySiteUserAndIsDeletedFalse(SiteUser siteUser);

    @Modifying
    @Query("UPDATE PaymentMethod pm SET pm.defaultPayment = false WHERE pm.siteUser = :siteUser AND pm.isDeleted = false")
    void unsetDefaultBySiteUser(@Param("siteUser") SiteUser siteUser);
}