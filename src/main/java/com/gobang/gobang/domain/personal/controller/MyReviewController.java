package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.response.ReviewResponse;
import com.gobang.gobang.domain.review.service.ReviewService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/reviews")
@RequiredArgsConstructor
public class MyReviewController {

    private final ReviewService reviewService;
    private final SiteUserService siteUserService;

    @GetMapping
    @Operation(summary = "마이페이지 - 내가 쓴 리뷰 목록")
    public RsData<List<ReviewResponse>> getMyReviews() {
        SiteUser user = siteUserService.getCurrentUser();
        List<ReviewResponse> reviews = reviewService.getReviewsByUserId(user.getId());
        return RsData.of("200", "리뷰 조회 성공", reviews);
    }
}