package com.gobang.gobang.domain.review.controller;

import com.gobang.gobang.domain.review.service.ReviewLikeService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews")
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;

    // (평균 별점)상품 상세 만들어지면 사용
    @GetMapping("/average/{productId}")
    public RsData<Map<String, Object>> getAverageRating(@PathVariable Long productId) {
        Map<String, Object> avgData = reviewLikeService.getAverageRating(productId);
        return RsData.of("200", "평균 별점 조회 성공", avgData);
    }

    // (평균 별점)상세 만들어지기 전 임시 사용
//    @GetMapping("/stats/average")
//    public RsData<Map<String, Object>> getAverageRating() {
//        Map<String, Object> avgData = reviewLikeService.getAverageRatingAndCount();
//        return RsData.of("200", "전체 리뷰 평균 조회 성공", avgData);
//    }

    @PostMapping("/{reviewId}/like")
    public RsData<Integer> toggleLike(@PathVariable Long reviewId) {
        return reviewLikeService.toggleLike(reviewId);
    }


}
