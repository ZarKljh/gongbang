package com.gobang.gobang.domain.personal.service;


import com.gobang.gobang.global.util.GeminiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AiMessageService {

    private final GeminiClient geminiClient;

    // userId -> 캐시 데이터 저장
    private final Map<Long, CachedMessage> cache = new ConcurrentHashMap<>();

    private static final long CACHE_MINUTES = 720; // 12시간 캐시

    public String generateCategoryRecommendMessage(Long userId, List<String> categoryNames) {

        // 1) 캐시 존재하면 바로 반환
        CachedMessage cached = cache.get(userId);
        if (cached != null && !cached.isExpired()) {
            return cached.message;
        }

        // 2) AI 프롬프트 생성
        String joinedCategories = String.join(", ", categoryNames);

        String prompt = """
            사용자가 최근 좋아요한 상품의 카테고리는 다음과 같다:
            %s
            
            위 카테고리를 기반으로 자연스럽고 친근한 한 문장의 추천 메시지를 작성하라.
            너무 길게 작성하지 말고, 20~40자 이내로 요약된 문장을 만들어라.
            """.formatted(joinedCategories);

        // 3) AI 호출
        String aiMessage = geminiClient.generateText(prompt);

        // 4) 실패 시 기본 문구 반환
        if (aiMessage == null || aiMessage.isBlank()) {
            aiMessage = "최근 선호하신 카테고리를 기반으로 추천 상품을 준비했어요!";
        }

        // 5) 캐시 저장
        cache.put(userId, new CachedMessage(aiMessage));

        return aiMessage;
    }

    // ===================== 캐시 모델 =====================
    private static class CachedMessage {
        private final String message;
        private final LocalDateTime saveTime;

        CachedMessage(String msg) {
            this.message = msg;
            this.saveTime = LocalDateTime.now();
        }

        boolean isExpired() {
            return saveTime.plusMinutes(CACHE_MINUTES).isBefore(LocalDateTime.now());
        }
    }
}