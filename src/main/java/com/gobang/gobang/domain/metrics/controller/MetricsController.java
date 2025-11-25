package com.gobang.gobang.domain.metrics.controller;

import com.gobang.gobang.domain.admin.dto.AdminMetricsDtos.MonthlyPoint;
import com.gobang.gobang.domain.metrics.entity.VisitorLog;
import com.gobang.gobang.domain.metrics.repository.VisitorLogRepository;
import com.gobang.gobang.domain.metrics.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricsController {
    private final MetricsService metricsService;
    private final VisitorLogRepository visitorLogRepository;

    @GetMapping("/visitors/monthly")
    public List<MonthlyPoint> monthlyVisitors(@RequestParam int year) {
        return metricsService.monthlyVisitors(year);
    }

    @PostMapping("/visit")
    public void recordVisit(@RequestBody VisitRequest req) {
        VisitorLog log = VisitorLog.builder()
                .path(req.path())          // "/"
                .userId(null)              // 나중에 로그인 붙이면 넣을 곳
                .referrer(req.referrer())  // 선택
                .build();

        visitorLogRepository.save(log);
    }

    public record VisitRequest(
            String path,
            String referrer
    ) {}
}
