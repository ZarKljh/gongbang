package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewLike;
import com.gobang.gobang.domain.review.repository.ReviewLikeRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewLikeService {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final Rq rq; // 로그인 유저 정보 가져옴

    public RsData<Integer> toggleLike(Long reviewId) {
        // 로그인한 유저
        var user = rq.getSiteUser();
        if (user == null) {
            return RsData.of("401", "로그인이 필요합니다.");
        }

        // 리뷰 찾기
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 이미 좋아요 누른 유저인지 확인
        boolean alreadyLiked = reviewLikeRepository.existsByReviewAndSiteUser_Id(review, user.getId());

        if (alreadyLiked) {
            // 이미 눌렀다면 좋아요 취소
            reviewLikeRepository.deleteByReviewAndSiteUser_Id(review, user.getId());
            review.setReviewLike(review.getReviewLike() - 1);
            reviewRepository.save(review);
            return RsData.of("200", "좋아요 취소됨", review.getReviewLike());
        } else {
            // 처음 누른 경우
            ReviewLike newLike = ReviewLike.builder()
                    .review(review)
                    .siteUser(user)
                    .build();
            reviewLikeRepository.save(newLike);
            review.setReviewLike(review.getReviewLike() + 1);
            reviewRepository.save(review);
            return RsData.of("200", "좋아요 등록됨", review.getReviewLike());
        }
    }

//    상품 상세 만들어지면 사용.
//    public Map<String, Object> getAverageRating(Long productId) {
//        Object[] result = reviewLikeRepository.findAverageRatingAndCountByProductId(productId);
//        Double avg = result[0] != null ? (Double) result[0] : 0.0;
//        Long count = result[1] != null ? (Long) result[1] : 0L;
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("avgRating", Math.round(avg * 10) / 10.0); // 소수점 1자리
//        response.put("totalCount", count);
//        return response;
//    }

    // 만들어지기 전 임시 사용
    public Map<String, Object> getAverageRatingAndCount() {
        Map<String, Object> result = reviewLikeRepository.findAverageRatingAndCountAsMap();

        double avg = ((Number) result.get("avgRating")).doubleValue();
        long count = ((Number) result.get("totalCount")).longValue();

        result.put("avgRating", Math.round(avg * 10) / 10.0);
        result.put("totalCount", count);

        return result;
    }
}