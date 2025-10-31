package com.gobang.gobang.domain.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewReportService {
//
//    private final ReviewRepository reviewRepository;
//    private final ReviewReportRepository reviewReportRepository;
//
//    // 전체 신고 조회 (관리자용)
//    public List<ReviewReport> getAllReports() {
//        return reviewReportRepository.findAll();
//    }
//
//    // 신고 단건 조회
//    public Optional<ReviewReport> getReportById(Long reportId) {
//        return reviewReportRepository.findById(reportId);
//    }
//
//    // 리뷰 신고 생성
//    @Transactional
//    public Optional<ReviewReport> createReport(Long reviewId, ReviewReport report) {
//        return reviewRepository.findById(reviewId)
//                .map(review -> {
//                    report.setReview(review);
//                    return reviewReportRepository.save(report);
//                });
//    }
//
//    // 신고 처리 상태 변경
//    @Transactional
//    public Optional<ReviewReport> resolveReport(Long reportId) {
//        return reviewReportRepository.findById(reportId)
//                .map(report -> {
//                    report.setResolved(true);
//                    return reviewReportRepository.save(report);
//                });
//    }
//
//    // 신고 삭제
//    @Transactional
//    public boolean deleteReport(Long reportId) {
//        if (reviewReportRepository.existsById(reportId)) {
//            reviewReportRepository.deleteById(reportId);
//            return true;
//        }
//        return false;
//    }
}
