package com.gobang.gobang.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;


// 임시용 컨트롤러

@RestController
@RequestMapping("/api/admin/v1")
public class ApiV1AdminController {


    //관리자 정보, 추후 시큐리티 연동 시 수정
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        return ResponseEntity.ok(Map.of(
                "id", 1,
                "email", "admin@example.com",
                "role", "ADMIN"
        ));
    }

    //알림 목록, 최소 페이징 추후 수정
    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> listNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        // 체크용 더미 데이터
        var content = List.of(
                Map.of(
                        "id", 9876,
                        "type", "MERCHANT_APPLY",
                        "title", "새 입점 신청",
                        "message", "무지리 공방 접수",
                        "level", "INFO",
                        "status", status == null ? "NEW" : status,
                        "createdAt", Instant.now().minusSeconds(3600).toString()
                )
        );
        return ResponseEntity.ok(Map.of(
                "content", content,
                "page", page,
                "size", size,
                "total", 1 // 지금은 더미 추후 DB 카운트
        ));
    }

    // 알림 상태 변경 patch
    @PatchMapping("/notifications/{id}")
    public ResponseEntity<Map<String, Object>> patchNotification(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        String status = String.valueOf(body.getOrDefault("status", "READ"));
        return ResponseEntity.ok(Map.of(
                "id", id,
                "status", status,
                "updatedAt", Instant.now().toString()
        ));
    }

    // 신고 목록
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> listReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        // 체크용 더미 데이터
        var content = List.of(
                Map.of(
                        "id", 30231,
                        "type", "SPAM",
                        "status", status == null ? "PENDING" : status,
                        "target", Map.of("type", "comment", "id", 112, "summary", "90% 할인 링크 반복"),
                        "createdAt", Instant.now().minusSeconds(1200).toString()
                )
        );
        return ResponseEntity.ok(Map.of(
                "content", content,
                "page", page,
                "size", size,
                "total", 1
        ));
    }

    // 신고 결정
    @PostMapping("/reports/{id}/decision")
    public ResponseEntity<Map<String, Object>> decideReport(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idemKey
    ) {
        String decision = String.valueOf(body.getOrDefault("decision", "APPROVE"));
        // 체크용 더미 데이터, 아이디 상태 변경
        String newStatus = switch (decision) {
            case "APPROVE" -> "RESOLVED";
            case "HOLD"    -> "IN_PROGRESS";
            case "REJECT"  -> "REJECTED";
            default        -> "PENDING";
        };
        return ResponseEntity.ok(Map.of(
                "reportId", id,
                "status", newStatus,
                "decision", decision,
                "auditId", 55501,
                "notificationId", 99001,
                "idemKey", idemKey
        ));
    }

    // 입점 신청 목록
    @GetMapping("/applications")
    public ResponseEntity<Map<String, Object>> listApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status // PENDING|NEEDS_REVISION|APPROVED|REJECTED
    ) {
        // 더미 데이터
        var content = List.of(
                Map.of(
                        "id", 9001,
                        "storeName", "무지리 공방",
                        "category", "WOOD",
                        "status", status == null ? "PENDING" : status,
                        "submittedAt", Instant.now().minusSeconds(7200).toString()
                )
        );
        return ResponseEntity.ok(Map.of(
                "content", content,
                "page", page,
                "size", size,
                "total", 1
        ));
    }

    // 입점 심사 결정
    @PostMapping("/applications/{id}/decision")
    public ResponseEntity<Map<String, Object>> decideApplication(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body, // { "decision": "APPROVE|REQUEST_CHANGES|REJECT", "reason": "..." }
            @RequestHeader(value = "Idempotency-Key", required = false) String idemKey
    ) {
        String decision = String.valueOf(body.getOrDefault("decision", "REQUEST_CHANGES"));
        String newStatus = switch (decision) {
            case "APPROVE"         -> "APPROVED";
            case "REQUEST_CHANGES" -> "NEEDS_REVISION";
            case "REJECT"          -> "REJECTED";
            default                -> "PENDING";
        };
        return ResponseEntity.ok(Map.of(
                "applicationId", id,
                "status", newStatus,
                "decision", decision,
                "auditId", 55510,
                "notificationId", 99010,
                "idemKey", idemKey
        ));
    }
}
