package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.personal.repository.WishListRepository;
//import com.gobang.gobang.domain.qna.repository.QnaRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ReviewRepository reviewRepository;
    private final WishListRepository wishListRepository;
    private final InquiryRepository inquiryRepository;
//    private final QnaRepository qnaRepository;

    public Map<String, Object> getStats(SiteUser user) {
        Map<String, Object> stats = new HashMap<>();

<<<<<<< HEAD
        long postCount = reviewRepository.countByUserId(user.getId());
        long qnaCount = inquiryRepository.countByUserId(user.getId());
=======
        long postCount = reviewRepository.countBySiteUser_Id(user.getId());

>>>>>>> 8bc40c24bff1e149a17459ec8530a5ac03b2e573
        long wishCount = wishListRepository.countBySiteUser_Id(user.getId());

        stats.put("postCount", postCount);
        stats.put("qnaCount", qnaCount);
        stats.put("wishCount", wishCount);

        return stats;
    }
}