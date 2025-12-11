package com.gobang.gobang.global.infra;

import com.fasterxml.jackson.databind.JsonNode;
import com.gobang.gobang.domain.delivery.dto.TrackingStepDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class DeliveryTrackerClient {

    private final DeliveryTrackerProperties props;

    // 간단히 new RestTemplate() 사용 (필요하면 @Bean 으로 빼도 됨)
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Delivery Tracker GraphQL Track API 를 사용해
     * carrierId + trackingNumber 기준으로 이벤트 타임라인을 조회한다.
     */
    public List<TrackingStepDto> getTrackingSteps(String carrierId, String trackingNumber) {

        String url = "https://apis.tracker.delivery/graphql";

        String query = """
                query Track($carrierId: ID!, $trackingNumber: String!) {
                  track(carrierId: $carrierId, trackingNumber: $trackingNumber) {
                    events(first: 10) {
                      edges {
                        node {
                          time
                          location { name }
                          status { name code }
                          description
                        }
                      }
                    }
                  }
                }
                """;

        Map<String, Object> body = Map.of(
                "query", query,
                "variables", Map.of(
                        "carrierId", carrierId,
                        "trackingNumber", trackingNumber
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(
                HttpHeaders.AUTHORIZATION,
                "TRACKQL-API-KEY " + props.getClientId() + ":" + props.getClientSecret()
        );

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                url,
                requestEntity,
                JsonNode.class
        );

        JsonNode root = response.getBody();
        List<TrackingStepDto> result = new ArrayList<>();

        // 응답이 없거나, GraphQL errors 가 있으면 빈 리스트 리턴
        if (root == null || root.has("errors")) {
            // TODO: 필요하면 root.get("errors") 로 로그 남기기
            return result;
        }

        JsonNode edges = root.path("data")
                .path("track")
                .path("events")
                .path("edges");

        if (!edges.isArray()) {
            return result;
        }

        for (JsonNode edge : edges) {
            JsonNode node = edge.path("node");

            String timeStr = node.path("time").asText(null);
            String locationName = node.path("location").path("name").asText("");
            String statusName = node.path("status").path("name").asText("");
            String description = node.path("description").asText("");

            // 상태 라벨: "상태명 - 설명" 형태로 합치기 (설명 없으면 상태명만)
            String statusLabel = statusName;
            if (description != null && !description.isEmpty()) {
                statusLabel = statusLabel + " - " + description;
            }

            String statusCode = node.path("status").path("code").asText("");
            String phone = extractPhone(statusLabel);

            // timeStr → LocalDateTime 으로 파싱
            LocalDateTime time = null;
            if (timeStr != null && !timeStr.isBlank()) {
                try {
                    // offset 포함된 ISO-8601(예: 2025-01-01T10:00:00+09:00) 우선
                    time = OffsetDateTime.parse(timeStr).toLocalDateTime();
                } catch (DateTimeParseException e) {
                    try {
                        // offset 없는 순수 LocalDateTime 형식 fallback
                        time = LocalDateTime.parse(timeStr);
                    } catch (DateTimeParseException ignored) {
                        // 그래도 안 되면 null 그대로 둠
                    }
                }
            }

            result.add(
                    TrackingStepDto.builder()
                            .location(locationName.isEmpty() ? "알 수 없음" : locationName)
                            .status(statusLabel)
                            .statusCode(statusCode.isBlank() ? null : statusCode)
                            .driverPhone(phone)
                            .time(time)
                            .build()
            );
        }

        result = result.stream()
                .filter(step -> step.getTime() != null)
                .sorted(Comparator.comparing(TrackingStepDto::getTime).reversed())
                .toList();

        return result;
    }

    private String extractPhone(String text) {
        if (text == null) return null;
        // 010-1234-5678, 01012345678 등 잡는 정규식
        Pattern p = Pattern.compile("(01[016789])[ -]?(\\d{3,4})[ -]?(\\d{4})");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1) + "-" + m.group(2) + "-" + m.group(3);
        }
        return null;
    }

}
