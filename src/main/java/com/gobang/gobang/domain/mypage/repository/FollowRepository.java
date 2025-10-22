package com.gobang.gobang.domain.mypage.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.mypage.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 사용자별 팔로우 목록 조회
    List<Follow> findBySiteUser(SiteUser siteUser);

    // 특정 셀러의 팔로워 목록 조회
    List<Follow> findByStudio(Studio studio);

    // 사용자가 특정 셀러를 팔로우하는지 확인
    Optional<Follow> existsBySiteUserAndStudio(SiteUser siteUser, Studio studio);

    // 셀러의 팔로워 수
    long countByStudio(Studio studio);

    // 사용자의 팔로잉 수
    long countBySiteUser(SiteUser siteUser);

    // 팔로우 여부 확인
    boolean existsBySiteUser_AndStudio(SiteUser siteUser, Studio studio);
}