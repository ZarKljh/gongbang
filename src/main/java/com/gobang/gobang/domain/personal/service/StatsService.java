package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.order.model.OrderStatus;
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

        long preparing = ordersRepository.countByStatus(user.getId(), OrderStatus.PAID);

        long shipping = ordersRepository.countByLatestDeliveryStatus(
                user.getId(),
                "배송중",
                OrderStatus.PAID
        );

        long completed = ordersRepository.countByLatestDeliveryStatus(
                user.getId(),
                "배송완료",
                OrderStatus.PAID
        );


        long completedWithin7Days = ordersRepository.countCompletedWithin7Days(
                user.getId(),
                LocalDateTime.now().minusDays(7)
        );

        return new StatsResponse(
                totalQna,
                totalReviews,
                preparing,
                shipping,
                Math.min(completed, completedWithin7Days)
        );
    }
}