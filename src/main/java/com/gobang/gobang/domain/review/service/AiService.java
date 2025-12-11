package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.global.util.GeminiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final GeminiClient geminiClient;

    public String summarizeReviews(String reviewText) {


        // 1) 리뷰 전처리 (토큰 줄이기)
        String cleaned = reviewText
                .replaceAll("[^ㄱ-ㅎ가-힣0-9.,!?\n ]", "")  // 불필요 문자 제거
                .trim();

        // 너무 길면 자르기 (무료티어 안정화)
        if (cleaned.length() > 1500) {
            cleaned = cleaned.substring(0, 1500);
        }

        String prompt = """
            다음 리뷰들의 공통된 장점과 단점을 간단히 요약해줘.

            형식:
            - 장점: 2~3줄
            - 단점: 1~2줄
            - 총평: 1줄

            리뷰:
            %s
            """.formatted(cleaned);


        return geminiClient.requestSummary(prompt);
    }
}
