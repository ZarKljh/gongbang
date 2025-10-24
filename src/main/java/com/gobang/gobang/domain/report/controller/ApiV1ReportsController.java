package com.gobang.gobang.domain.report.controller;


import com.gobang.gobang.domain.report.dto.ReportResponse;
import com.gobang.gobang.domain.report.dto.ReportStatusUpdateRequest;
import com.gobang.gobang.domain.report.entity.Report;
import com.gobang.gobang.domain.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;



// 관리자 전용 컨트롤러 입니다 인증/권한을 강화하기 위해 나눴습니다.
@RestController
@RequestMapping("/api/admin/v1/reports")
@RequiredArgsConstructor
public class ApiV1ReportsController {

    private final ReportService reportService;

    // 신고 목록
    @GetMapping
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

    @GetMapping("/{id}")
    public ReportResponse get(@PathVariable Long id) {
        Report r = reportService.getById(id);
        return ReportResponse.from(r);
    }


    @GetMapping("/count/pending")
    public Map<String, Long> countPending() {
        long count = reportService.countPending();
        return Map.of("count", count); // 임시 하드코딩
    }

    @PostMapping("/{id}/status")
    public ReportResponse updateStatus(@PathVariable Long id,
                                       @Valid @RequestBody ReportStatusUpdateRequest req) {
        Report updated = reportService.updateStatus(id, req);
        return ReportResponse.from(updated);
    }

    // 신고 결정
    @PostMapping("/{id}/decision")
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

    @PostMapping("/ack")
    public Map<String, Boolean> acknowledgeAll() {
        reportService.acknowledgeAll();
        return Map.of("ok", true);
    }




}


