package com.gobang.gobang.domain.mypage.repository;

import com.gobang.gobang.domain.mypage.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    List<Follow> findByUserId(Long userId);
    void deleteBySellerIdAndUserId(Long sellerId, Long userId);
}
