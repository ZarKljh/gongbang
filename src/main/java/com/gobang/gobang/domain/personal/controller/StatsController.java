package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.service.StatsService;
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
    public Map<String, Object> getUserStats(@RequestParam Long userId) {
        System.out.println("📊 [요청 userId] " + userId);

        try {
            SiteUser user = siteUserRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("❌ 사용자를 찾을 수 없습니다."));

            Map<String, Object> stats = statsService.getStats(user);
            System.out.println("✅ 통계 데이터 생성 완료: " + stats);
            return stats;
        } catch (Exception e) {
            System.out.println("🔥 [서버 오류 발생]");
            e.printStackTrace();  // <-- 여기서 실제 에러가 콘솔에 찍힘
            throw e;
        }
    }
}