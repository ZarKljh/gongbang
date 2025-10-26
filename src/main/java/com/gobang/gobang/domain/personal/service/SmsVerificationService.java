package com.gobang.gobang.domain.personal.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SmsVerificationService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String CODE_PREFIX = "verify:";
    private static final String STATUS_PREFIX = "verified:";

    // 인증번호 발송
    public void sendCode(String phoneNumber) {
        String code = String.format("%06d", new Random().nextInt(1000000));
        redisTemplate.opsForValue().set(CODE_PREFIX + phoneNumber, code, 3, TimeUnit.MINUTES);
        System.out.println("📱 [문자 전송] " + phoneNumber + " → 인증번호: " + code);
    }

    // 인증번호 검증 & 인증 상태 저장
    public boolean verifyCode(String phoneNumber, String inputCode) {
        String storedCode = redisTemplate.opsForValue().get(CODE_PREFIX + phoneNumber);
        boolean match = storedCode != null && storedCode.equals(inputCode);

        if (match) {
            redisTemplate.opsForValue().set(STATUS_PREFIX + phoneNumber, "true", 10, TimeUnit.MINUTES);
            redisTemplate.delete(CODE_PREFIX + phoneNumber);
        }

        return match;
    }

    // 인증 상태 확인
    public boolean isVerified(String phoneNumber) {
        return "true".equals(redisTemplate.opsForValue().get(STATUS_PREFIX + phoneNumber));
    }

    // 인증 상태 초기화
    public void clearVerification(String phoneNumber) {
        redisTemplate.delete(STATUS_PREFIX + phoneNumber);
    }
}