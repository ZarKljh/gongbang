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
import java.util.List;
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
            return RsData.of("202", "좋아요 취소됨", review.getReviewLike());
        } else {
            // 처음 누른 경우
            ReviewLike newLike = ReviewLike.builder()
                    .review(review)
                    .siteUser(user)
                    .build();
            reviewLikeRepository.save(newLike);
            review.setReviewLike(review.getReviewLike() + 1);
            reviewRepository.save(review);
            return RsData.of("201", "좋아요 등록됨", review.getReviewLike());
        }
    }

    // 내가 좋아요를 눌렀는지 여부 확인용
    public List<Long> getMyLikes(Long userId, Long productId) {
        return reviewLikeRepository.findLikedReviewIds(userId, productId);
    }
}