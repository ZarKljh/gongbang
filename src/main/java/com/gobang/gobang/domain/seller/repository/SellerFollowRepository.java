package com.gobang.gobang.domain.seller.repository;

import com.gobang.gobang.domain.personal.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerFollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByStudio_StudioIdAndSiteUser_Id(Long studioId, Long userId);

    long countByStudio_StudioId(Long studioId);
}
