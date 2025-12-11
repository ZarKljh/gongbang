package com.gobang.gobang.domain.delivery.repository;

import com.gobang.gobang.domain.delivery.entity.DeliveryTracking;
import com.gobang.gobang.domain.personal.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryTrackingRepository extends JpaRepository<DeliveryTracking, Long> {

    List<DeliveryTracking> findByDeliveryOrderByEventTimeDesc(Delivery delivery);
}
