package com.gobang.gobang.domain.metrics.controller;

import com.gobang.gobang.domain.admin.dto.AdminMetricsDtos.MonthlyPoint;
import com.gobang.gobang.domain.metrics.service.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricsController {
    private final MetricsService metricsService;

    @GetMapping("/visitors/monthly")
    public List<MonthlyPoint> monthlyVisitors(@RequestParam int year) {
        return metricsService.monthlyVisitors(year);
    }
}
