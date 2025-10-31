package com.gobang.gobang.domain.report.controller;

import com.gobang.gobang.domain.report.dto.ReportRequest;
import com.gobang.gobang.domain.report.dto.ReportResponse;
import com.gobang.gobang.domain.report.entity.Report;
import com.gobang.gobang.domain.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


// 일반 유저가 신고를 제출 하는 용도의 엔드포인트용 컨트롤러 입니다 보안을 위해 나눴습니다
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class PublicReportController {

    private final ReportService reportService;

    @PostMapping
    public ReportResponse create(@Valid @RequestBody ReportRequest req) {
        Report saved = reportService.create(req);
        return ReportResponse.from(saved);
    }
}
