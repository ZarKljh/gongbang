package com.gobang.gobang.domain.report.controller;

import com.gobang.gobang.domain.report.dto.ReportStatusUpdateRequest;
import com.gobang.gobang.domain.report.entity.Report;
import com.gobang.gobang.domain.report.model.ReportStatus;
import com.gobang.gobang.domain.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
public class ApiV1ReportsController {

    private final ReportService reportService;

    @GetMapping
    public List<Report> getReports(@RequestParam(required = false) ReportStatus status) {
        List<Report> all = reportService.getAll();


        if (status == null) return all;
        return all.stream()
                .filter(r -> r.getStatus() == status)
                .toList();
    }


    @GetMapping("/{id}")
    public Report getOne(@PathVariable Long id) {
        return reportService.getById(id);
    }


    @GetMapping("/count/pending")
    public Map<String, Long> countPending() {
        long count = reportService.countPending();
        return Map.of("count", count);
    }

    @PostMapping("/ack")
    public Map<String, Boolean> ackAll() {
        reportService.acknowledgeAll();
        return Map.of("ok", true);
    }


    @PatchMapping("/{id}/status")
    public Report updateStatus(
            @PathVariable Long id,
            @RequestBody ReportStatusUpdateRequest request
    ) {
        return reportService.updateStatus(id, request);
    }
}
