package com.gobang.gobang.domain.review.controller;

import com.gobang.gobang.domain.review.entity.ReviewReport;
import com.gobang.gobang.domain.review.service.ReviewReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reports")
public class ReviewReportController {
//
//    private final ReviewReportService reviewReportService;
//
//    @GetMapping
//    public ResponseEntity<List<ReviewReport>> getAllReports() {
//        return ResponseEntity.ok(reviewReportService.getAllReports());
//    }
//
//    @PostMapping("/{reviewId}")
//    public ResponseEntity<?> createReport(@PathVariable Long reviewId, @RequestBody ReviewReport report) {
//        return reviewReportService.createReport(reviewId, report)
//                .map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @PatchMapping("/{reportId}/resolve")
//    public ResponseEntity<?> resolveReport(@PathVariable Long reportId) {
//        return reviewReportService.resolveReport(reportId)
//                .map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @DeleteMapping("/{reportId}")
//    public ResponseEntity<Void> deleteReport(@PathVariable Long reportId) {
//        boolean deleted = reviewReportService.deleteReport(reportId);
//        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
//    }
}
