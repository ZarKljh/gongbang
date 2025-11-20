package com.gobang.gobang.domain.review.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.review.service.ReviewLikeService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews")
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;
    private final Rq rq;

    @PostMapping("/{reviewId}/like")
    public RsData<Integer> toggleLike(@PathVariable Long reviewId) {
        return reviewLikeService.toggleLike(reviewId);
    }

    // 내가 누른 좋아요 확인용
    @GetMapping("/likes/me")
    public RsData<List<Long>> getMyLikes(@RequestParam Long productId) {
        SiteUser currentUser = rq.getSiteUser();
        if (currentUser == null) {
            return RsData.of("401", "로그인이 필요합니다.");
        }

        List<Long> likedReviewIds = reviewLikeService.getMyLikes(currentUser.getId(), productId);
        return RsData.of("200", "좋아요 목록 조회 성공", likedReviewIds);
    }
}
