package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.personal.dto.response.RecommendResponse;
import com.gobang.gobang.domain.personal.service.RecommendService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mypage/recommend")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;

    @GetMapping("/wishlist")
    public RsData<?> getWishlistRecommend() {

        Long userId = 1L; // 임시 — 나중에 JWT에서 가져오는 코드로 교체

        RecommendResponse response = recommendService.getWishlistRecommend(userId);

        return RsData.of("200", "추천 상품 조회 성공", response);
    }
}