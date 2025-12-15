package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByDeliveryIdAndOrder_SiteUser_Id(
            Long deliveryId,
            Long userId
    );


    Optional<Delivery> findByOrder_OrderIdAndOrder_SiteUser(
            Long orderId,
            SiteUser siteUser
    );
}