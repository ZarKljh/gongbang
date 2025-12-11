package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.global.util.GeminiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final GeminiClient geminiClient;

    public String summarizeReviews(String reviewText) {

        String prompt = """
                당신은 쇼핑몰 리뷰 전문가입니다.

                아래는 동일한 상품을 구매한 고객들의 리뷰입니다.
                핵심 의견을 중복 제거하여 아래 형식으로 요약해주세요:

                1) 고객들이 공통적으로 만족한 점 (2~3줄)
                2) 개선되었으면 하는 점 (있다면 1~2줄)
                3) 전체적인 총평 (1~2줄)

                리뷰 내용:
                %s
                """.formatted(reviewText);

        return geminiClient.requestSummary(prompt);
    }
}
