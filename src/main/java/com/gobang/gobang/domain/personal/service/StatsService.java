package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;

    public Map<String, Object> getStats(SiteUser user) {
        Map<String, Object> stats = new HashMap<>();

        long reviewCount = reviewRepository.countBySiteUser_Id(user.getId());
        long qnaCount = inquiryRepository.countByWriter_Id(user.getId());

        stats.put("reviewCount", reviewCount);
        stats.put("qnaCount", qnaCount);

        return stats;
    }
}