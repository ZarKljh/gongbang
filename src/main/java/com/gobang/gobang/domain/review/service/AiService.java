package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.global.util.OpenAIClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final OpenAIClient openAIClient;

    public String summarizeReviews(String reviewText) {

        String prompt = """
                아래는 동일한 상품의 고객 리뷰들입니다.
                중복 내용은 묶어서 하나로 정리하고,
                긍정적 / 부정적 의견을 각각 2~3개씩 정리한 뒤,
                마지막에 전체적인 총평을 2문장으로 요약해줘.

                리뷰:
                %s
                """.formatted(reviewText);

        return openAIClient.generateChatCompletion(prompt);
    }
}
