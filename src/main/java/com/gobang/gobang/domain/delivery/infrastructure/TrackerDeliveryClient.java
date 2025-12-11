package com.gobang.gobang.domain.delivery.infrastructure;

import com.gobang.gobang.domain.delivery.dto.TrackingStepDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrackerDeliveryClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${tracker.delivery.base-url:https://tracker.delivery}")
    private String baseUrl;

    // 필요하다면 API 키
    // @Value("${tracker.delivery.api-key:}")
    // private String apiKey;

    /**
     * tracker.delivery API를 호출해서 실시간 배송 이력을 가져온다.
     *
     * @param carrierCode 택배사 코드 (예: "kr.cjlogistics")
     * @param trackingNumber 운송장 번호
     */
    public List<TrackingStepDto> getTrackingSteps(String carrierCode, String trackingNumber) {
        try {
            // 실제 가이드는 tracker.delivery에서 확인해서 맞춰줘야 함 (URL, 파라미터 구조 등)
            // 예시: GET https://tracker.delivery/api/tracking?carrier=kr.cjlogistics&tracking_number=1234567890
            String url = baseUrl + "/api/tracking?carrier=" + carrierCode + "&tracking_number=" + trackingNumber;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // 필요시 인증 헤더 추가
            // headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseSteps(response.getBody());
            } else {
                log.warn("tracker.delivery 응답 실패 status={}, body={}", response.getStatusCode(), response.getBody());
                return List.of();
            }
        } catch (Exception e) {
            log.error("tracker.delivery 호출 중 에러", e);
            return List.of(); // 실패 시 빈 리스트 반환
        }
    }

    /**
     * tracker.delivery 응답 JSON을 우리 DTO 리스트로 변환
     * 실제 응답 구조는 tracker.delivery 가이드 보고 맞추기!
     */
    @SuppressWarnings("unchecked")
    private List<TrackingStepDto> parseSteps(Map body) {
        List<TrackingStepDto> result = new ArrayList<>();

        // 예시 구조 (가이드 문서 보고 맞춰서 수정):
        // {
        //   "events": [
        //       {
        //          "time": "2025-02-27T15:44:00+09:00",
        //          "location": "대전서구갈마",
        //          "message": "배송완료"
        //       },
        //       ...
        //   ]
        // }
        List<Map<String, Object>> events = (List<Map<String, Object>>) body.get("events");
        if (events == null) return result;

        for (Map<String, Object> ev : events) {
            String location = (String) ev.getOrDefault("location", "");
            String status = (String) ev.getOrDefault("message", "");
            String timeStr = (String) ev.getOrDefault("time", null);

            LocalDateTime time = null;
            try {
                if (timeStr != null) {
                    time = LocalDateTime.ofInstant(
                            java.time.OffsetDateTime.parse(timeStr).toInstant(),
                            ZoneId.systemDefault()
                    );
                }
            } catch (Exception e) {
                // 파싱 실패 시 null 허용
            }

            result.add(TrackingStepDto.builder()
                    .location(location)
                    .status(status)
                    .time(time)
                    .build());
        }

        return result;
    }
}
