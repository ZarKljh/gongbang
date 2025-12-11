package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.response.RecommendResponse;
import com.gobang.gobang.domain.personal.service.RecommendService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mypage/recommend")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;
    private final SiteUserService siteUserService;

    @GetMapping("/wishlist")
    public ResponseEntity<RsData<RecommendResponse>> getWishlistRecommend() {

        SiteUser user = siteUserService.getCurrentUser();
        if (user == null) {
            return ResponseEntity
                    .status(401)
                    .body(RsData.of("401", "로그인이 필요합니다.", null));
        }

        RecommendResponse response = recommendService.getWishlistRecommend(user.getId());

        return ResponseEntity.ok(RsData.of(
                "200",
                "추천 상품 조회 성공",
                response
        ));
    }
}