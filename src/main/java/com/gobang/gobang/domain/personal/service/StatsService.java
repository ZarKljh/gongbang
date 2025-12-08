package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final OrdersRepository ordersRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;

    public Map<String, Object> getStats(SiteUser user) {
        Map<String, Object> stats = new HashMap<>();

        long totalReviews = reviewRepository.countBySiteUser_Id(user.getId());
        long totalQna = inquiryRepository.countByWriter_Id(user.getId());

        // 배송준비중: Orders 기준 전체 카운트
        long preparing = ordersRepository.countByStatus(user.getId(), "배송준비중");

        // 배송중: Orders 기준 전체 카운트
        long shipping = ordersRepository.countByStatus(user.getId(), "배송중");

        // 배송완료: 최근 7일 Orders 기준 카운트
        long completed = ordersRepository.countCompletedWithin7Days(user.getId(), LocalDateTime.now().minusDays(7));

        stats.put("totalReviews", totalReviews);
        stats.put("totalQna", totalQna);
        stats.put("preparing", preparing);
        stats.put("shipping", shipping);
        stats.put("completed", completed);

        return stats;
    }
}