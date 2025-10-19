package com.gobang.gobang.domain.review.controller;


import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewReport;
import com.gobang.gobang.domain.review.repository.ReviewCommentRepository;
import com.gobang.gobang.domain.review.repository.ReviewReportRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final ReviewCommentRepository reviewCommentRepository;

    // 리뷰 목록 조회 (더미 데이터)
    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        Review review1 = Review.builder()
                .id(1L)
                .content("게임이 정말 재밌어요! 그래픽도 훌륭하고 추천합니다.")
                .rating(5)
                .isActive(true)
                .build();

        Review review2 = Review.builder()
                .id(2L)
                .content("조금 지루했어요. 다음 업데이트를 기대합니다.")
                .rating(3)
                .isActive(true)
                .build();

        Review review3 = Review.builder()
                .id(3L)
                .content("서버가 자주 끊기네요. 개선 필요합니다.")
                .rating(2)
                .isActive(true)
                .build();

        List<Review> reviews = Arrays.asList(review1, review2, review3);
        return ResponseEntity.ok(reviews);
    }

    // 리뷰 신고 (더미)
    @GetMapping("/reports/dummy")
    public ResponseEntity<List<ReviewReport>> getDummyReports() {
        Review review1 = Review.builder().id(1L).content("게임이 정말 재밌어요!").rating(5).isActive(true).build();
        Review review3 = Review.builder().id(3L).content("서버가 자주 끊기네요.").rating(2).isActive(true).build();

        ReviewReport report1 = ReviewReport.builder()
                .id(1L)
                .reason("욕설 포함")
                .review(review1)
                .build();

        ReviewReport report2 = ReviewReport.builder()
                .id(2L)
                .reason("광고성 댓글")
                .review(review3)
                .build();

        List<ReviewReport> reports = Arrays.asList(report1, report2);
        return ResponseEntity.ok(reports);
    }
}

    // 리뷰 목록 조회
//    @GetMapping
//    public ResponseEntity<List<Review>> getAllReviews() {
//        return ResponseEntity.ok(reviewRepository.findAll());
//    }

    // 리뷰 등록
//    @PostMapping
//    public ResponseEntity<Review> createReview(@RequestBody Review review) {
//        return ResponseEntity.ok(reviewRepository.save(review));
//    }
//
//    // 리뷰 수정
//    @PatchMapping("/{id}")
//    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review updatedReview) {
//        return reviewRepository.findById(id)
//                .map(r -> {
//                    r.setContent(updatedReview.getContent());
//                    r.setRating(updatedReview.getRating());
//                    return ResponseEntity.ok(reviewRepository.save(r));
//                })
//                .orElse(ResponseEntity.notFound().build());
//    }

//    // 리뷰 삭제 (소프트 딜리트) 추후 수정
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
//        return reviewRepository.findById(id)
//                .map(r -> {
//                    r.setIsActive(false);
//                    reviewRepository.save(r);
//                    return ResponseEntity.ok().build();
//                })
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    // 리뷰 신고 등록
//    @PostMapping("/{id}/report")
//    public ResponseEntity<ReviewReport> reportReview(@PathVariable Long id, @RequestBody ReviewReport report) {
//        return reviewRepository.findById(id)
//                .map(r -> {
//                    report.setReview(r);
//                    return ResponseEntity.ok(reviewReportRepository.save(report));
//                })
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    // 리뷰 신고 삭제
//    @DeleteMapping("/reports/{reportId}")
//    public ResponseEntity<Void> deleteReport(@PathVariable Long reportId) {
//        reviewReportRepository.deleteById(reportId);
//        return ResponseEntity.ok().build();
//    }
//}