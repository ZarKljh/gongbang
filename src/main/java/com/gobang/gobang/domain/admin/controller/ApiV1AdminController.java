package com.gobang.gobang.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;


// 임시용 컨트롤러

@RestController
@RequestMapping("/api/v1/admin")
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






}
