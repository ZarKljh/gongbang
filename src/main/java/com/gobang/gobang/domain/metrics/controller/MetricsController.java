package com.gobang.gobang.domain.metrics.controller;


import com.gobang.gobang.domain.metrics.dto.MonthlyVisitorsDto;
import com.gobang.gobang.domain.metrics.service.MetricsService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1/metrics")
@AllArgsConstructor
public class MetricsController {
    private final MetricsService metricsService;

    @GetMapping("/visitors/monthly")
    public List<MonthlyVisitorsDto> getMonthlyVisitors(@RequestParam int year) {
        return metricsService.getMonthlyVisitors(year);
    }

}
