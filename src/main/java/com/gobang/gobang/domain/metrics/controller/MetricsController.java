package com.gobang.gobang.domain.metrics.controller;

import com.gobang.gobang.domain.admin.dto.AdminMetricsDtos.MonthlyPoint;
import com.gobang.gobang.domain.metrics.dto.RecordVisitRequest;
import com.gobang.gobang.domain.metrics.service.MetricsService;
import com.gobang.gobang.domain.metrics.service.VisitRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricsController {

    private final MetricsService metricsService;
    private final VisitRecordService visitRecordService;

    @GetMapping("/visitors/monthly")
    public List<MonthlyPoint> monthlyVisitors(@RequestParam int year) {
        return metricsService.monthlyVisitors(year);
    }

    @PostMapping("/visit")
    public void recordVisit(@RequestBody RecordVisitRequest req) {
        visitRecordService.recordDailyUniqueVisit(req);
    }
}
