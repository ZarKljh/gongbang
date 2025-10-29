package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.SiteUserUpdateRequest;
import com.gobang.gobang.domain.personal.dto.response.SiteUserResponse;
import com.gobang.gobang.domain.personal.service.SmsVerificationService;
import com.gobang.gobang.domain.personal.service.VerificationStatusService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class UserController {
    private final SiteUserService siteUserService;
    private final SmsVerificationService smsVerificationService;
    private final VerificationStatusService verificationStatusService;

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

    @PostMapping("/verify/send")
    public RsData<?> sendVerification(@RequestParam String phoneNumber) {
        smsVerificationService.sendCode(phoneNumber);
        return RsData.of("200", "인증번호 발송 완료");
    }

    @PostMapping("/verify/check")
    public RsData<?> checkVerification(@RequestParam String phoneNumber, @RequestParam String code) {
        boolean success = smsVerificationService.verifyCode(phoneNumber, code);
        if (!success) return RsData.of("400", "인증 실패");
        return RsData.of("200", "전화번호 인증 완료");
    }

    @PatchMapping("/update")
    public RsData<SiteUserResponse> updateUser(@RequestBody SiteUserUpdateRequest request) {
        try {
            return RsData.of("200", "사용자 정보 수정 성공", siteUserService.updateUserInfo(request));
        } catch (IllegalStateException e) {
            return RsData.of("400", e.getMessage(), null); // 인증 실패 등은 400으로 처리 가능
        }
    }
}
