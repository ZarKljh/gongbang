package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.personal.dto.response.StatsResponse;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final OrdersRepository ordersRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;

    public StatsResponse getStats(SiteUser user) {

        long totalReviews = reviewRepository.countBySiteUser_Id(user.getId());
        long totalQna = inquiryRepository.countByWriter_Id(user.getId());

        // 배송준비중: Orders 기준 전체 카운트
        long preparing = ordersRepository.countByDeliveryStatus(user.getId(), "배송준비중");

        // 배송중: Orders 기준 전체 카운트
        long shipping = ordersRepository.countByDeliveryStatus(user.getId(), "배송중");

        // 배송완료: 최근 7일 Orders 기준 카운트
        long completed = ordersRepository.countCompletedWithin7Days(user.getId(), LocalDateTime.now().minusDays(7));

        return new StatsResponse(
                totalQna,
                totalReviews,
                preparing,
                shipping,
                completed
        );
    }
}