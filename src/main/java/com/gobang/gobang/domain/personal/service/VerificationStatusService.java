package com.gobang.gobang.domain.personal.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class VerificationStatusService {

    private final RedisTemplate<String, String> redisTemplate;

    public void setVerified(String phoneNumber) {
        redisTemplate.opsForValue().set("verified:" + phoneNumber, "true", 5, TimeUnit.MINUTES);
    }

    public boolean isVerified(String phoneNumber) {
        String status = redisTemplate.opsForValue().get("verified:" + phoneNumber);
        return "true".equals(status);
    }
}