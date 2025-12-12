package com.gobang.gobang.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiClient {

    @Value("${gemini.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String requestSummary(String prompt) {
        String url =
                "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key="
                        + apiKey;


        // 요청 JSON 바디
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
        );

        // 응답 파싱 구조
        List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.getBody().get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            return "AI 응답을 가져오지 못했습니다.";
        }

        Map<String, Object> content =
                (Map<String, Object>) candidates.get(0).get("content");

        List<Map<String, Object>> parts =
                (List<Map<String, Object>>) content.get("parts");

        return (String) parts.get(0).get("text");
    }

    public String generateText(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response =
                    restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

            return extractText(response.getBody());

        } catch (Exception e) {
            System.out.println("===== GEMINI API ERROR =====");
            System.out.println("Message = " + e.getMessage());
            e.printStackTrace(); // ← 이거 꼭 추가!!!
            System.out.println("=================================");
            return "";  // 빈 문자열로 리턴해야 프론트에서 정상 처리됨
        }
    }

    private String extractText(Map response) {
        if (response == null) return "";

        try {
            List candidates = (List) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "";

            Map first = (Map) candidates.get(0);
            Map content = (Map) first.get("content");
            if (content == null) return "";

            List parts = (List) content.get("parts");
            if (parts == null || parts.isEmpty()) return "";

            Map part = (Map) parts.get(0);
            Object text = part.get("text");

            return text != null ? text.toString() : "";
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}
