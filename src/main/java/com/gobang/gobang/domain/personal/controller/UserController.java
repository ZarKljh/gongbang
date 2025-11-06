package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.SiteUserUpdateRequest;
import com.gobang.gobang.domain.personal.dto.response.SiteUserResponse;
import com.gobang.gobang.domain.personal.service.StatsService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class UserController {
    private final SiteUserService siteUserService;
    private final StatsService statsService;

    @GetMapping("/me")
    public RsData<SiteUserResponse> getMyInfo() {
        try {
            return RsData.of("200", "사용자 기본 정보 조회 성공", siteUserService.getCurrentUserInfo());
        } catch (IllegalStateException e) {
            // JWT 만료 혹은 로그인 안 됨 처리
            return RsData.of("401", e.getMessage(), null);
        }
    }

    @GetMapping("/me/detail")
    public RsData<SiteUserResponse> getMyDetail() {
        try {
            return RsData.of("200", "사용자 상세 정보 조회 성공", siteUserService.getCurrentUserDetail());
        } catch (IllegalStateException e) {
            return RsData.of("401", e.getMessage(), null);
        }
    }

    @PatchMapping("/me/{id}")
    public RsData<SiteUserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody SiteUserUpdateRequest request) {
        try {
            // 실제 업데이트 시, 현재 로그인한 사용자와 id 일치 확인 가능
            SiteUserResponse updatedUser = siteUserService.updateUserInfo(request);
            return RsData.of("200", "사용자 정보 수정 성공", updatedUser);
        } catch (IllegalStateException e) {
            return RsData.of("400", e.getMessage(), null);
        } catch (Exception e) {
            return RsData.of("500", "서버 오류 발생", null);
        }
    }

    @PostMapping("/me/verify-password")
    public RsData<Boolean> verifyPassword(@RequestBody Map<String, String> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId"));
            String password = payload.get("password");

            boolean ok = siteUserService.verifyPassword(userId, password);
            if (ok) {
                return RsData.of("200", "비밀번호 인증 성공", true);
            } else {
                return RsData.of("400", "비밀번호가 일치하지 않습니다", false);
            }
        } catch (Exception e) {
            return RsData.of("500", "서버 오류 발생", false);
        }
    }

//    @GetMapping("/stats")
//    public RsData<Map<String, Long>> getUserStats() {
//        Map<String, Long> stats = statsService.getUserStats();
//        return RsData.of("200", "마이페이지 통계 조회 성공", stats);
//    }
}
