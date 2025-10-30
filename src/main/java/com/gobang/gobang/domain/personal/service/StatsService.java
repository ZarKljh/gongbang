package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ReviewRepository reviewRepository; // Review JPA 리포지토리

    public Map<String, Object> getStats(SiteUser user) {
        Map<String, Object> stats = new HashMap<>();

        // 포인트가 SiteUser에 없다면 임시로 0
        stats.put("totalPoints", 0);

        // 리뷰 개수: userId로 Review 조회
        int totalReviews = reviewRepository.countByUserIdAndIsActiveTrue(user.getId());
        stats.put("totalReviews", totalReviews);

        // 등급
        stats.put("membershipLevel", "Newbie");

        return stats;
    }
}