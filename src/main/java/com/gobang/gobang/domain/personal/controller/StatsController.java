package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.dto.response.StatsResponse;
import com.gobang.gobang.domain.personal.service.StatsService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mypage")
public class StatsController {

    private final StatsService statsService;
    private final SiteUserRepository siteUserRepository;

    @GetMapping("/stats")
    public RsData<StatsResponse> getUserStats(@RequestParam Long userId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        StatsResponse stats = statsService.getStats(user);

        return RsData.of("200", "success", stats);
    }
}