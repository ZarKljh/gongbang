package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findBySiteUser(SiteUser siteUser);

    Optional<UserAddress> findByUserAddressIdAndSiteUser_Id(
            Long addressId,
            Long userId
    );

    boolean existsBySiteUserAndIsDefault(SiteUser siteUser, boolean isDefault);

    @Modifying
    @Query("""
        UPDATE UserAddress ua
        SET ua.isDefault = false
        WHERE ua.siteUser.id = :userId
            AND ua.isDefault = true
    """)
    void clearDefaultAddress(@Param("userId") Long userId);

    //hj 기본배송지 조회 추가
    Optional<UserAddress> findBySiteUserAndIsDefaultTrue(SiteUser user);
    boolean existsBySiteUserAndIsDefaultTrue(SiteUser user); // ✅ 추가
}