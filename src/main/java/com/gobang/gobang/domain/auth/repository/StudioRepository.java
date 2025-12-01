package com.gobang.gobang.domain.auth.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.seller.model.StudioStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudioRepository extends JpaRepository<Studio, Long> {
    Optional<Studio> findBySiteUser(SiteUser siteUser);
    Optional<Studio> findByStudioId(Long studioId);

    // 관리자 페이지 입점 최신순 리스트 추가 - 상진
    Page<Studio> findAllByOrderByCreatedDateDesc(Pageable pageable);

    // 상태별 최근 리스트 추가 - 상진
    Page<Studio> findByStatusOrderByCreatedDateDesc(StudioStatus status, Pageable pageable);
}
