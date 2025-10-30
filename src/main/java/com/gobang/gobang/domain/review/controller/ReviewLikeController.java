package com.gobang.gobang.domain.review.controller;

import com.gobang.gobang.domain.review.service.ReviewLikeService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews")
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;

    @PostMapping("/{reviewId}/like")
    public RsData<Integer> toggleLike(@PathVariable Long reviewId) {
        return reviewLikeService.toggleLike(reviewId);
    }
}
