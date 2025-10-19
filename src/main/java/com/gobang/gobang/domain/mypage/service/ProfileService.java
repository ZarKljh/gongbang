package com.gobang.gobang.domain.mypage.service;


import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ProfileService {

    // 비밀번호 본인확인
    public void verifyPassword(String password) {
        // 실제 검증 로직
        // 현재 로그인한 사용자의 비밀번호와 비교
    }

    // 기본 정보 조회
    public Map<String, Object> getProfile() {
        // DB에서 사용자 정보 조회
        return Map.of(
                "username", "user1",
                "email", "user1@example.com",
                "phone", "010-1234-5678",
                "createdAt", "2024-01-01"
        );
    }

    // 기본 정보 수정
    public void updateProfile(Map<String, Object> profileData) {
        // username, email, phone 등 업데이트
        // DB 저장 로직
    }

    // 전화번호 인증번호 발송
    public void sendPhoneVerification(String phone) {
        // SMS 인증번호 발송 로직
        // 인증번호 임시 저장 (Redis 등)
    }

    // 이메일 인증번호 발송
    public void sendEmailVerification(String email) {
        // 이메일 인증번호 발송 로직
        // 인증번호 임시 저장
    }
}