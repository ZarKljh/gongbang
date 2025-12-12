package com.gobang.gobang.domain.personal.service;


import com.gobang.gobang.global.util.GeminiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiMessageService {

    private final GeminiClient geminiClient;

    public String generateCategoryRecommendMessage(List<String> categoryNames) {

        String joinedCategories = String.join(", ", categoryNames);

        String prompt = """
            사용자가 최근 한 달 동안 자주 좋아요한 상품 카테고리는 다음과 같다:
            %s
            
            위 카테고리를 기반으로 "자연스럽고 짧은 한 문장" 형태의 추천 메시지를 작성하라.
            예시: "최근 악세사리 제품을 많이 좋아하셔서 비슷한 스타일의 상품을 추천드려요!"
            """.formatted(joinedCategories);

        return geminiClient.generateText(prompt).trim();
    }
}
